const { db } = require('../../../lib/firebase');
const { adminGuard } = require('../../../lib/auth');

module.exports = async (req, res) => {
  if (!adminGuard(req, res)) return;
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const orderId = req.query.id || (req.url || '').split('/').pop();
  const body = (typeof req.body === 'object' ? req.body : {});
  const { status } = body;

  const validStatuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const now = new Date().toISOString();

  try {
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderDoc.data();
    const oldStatus = order.status;

    await db.runTransaction(async (transaction) => {
      transaction.update(db.collection('orders').doc(orderId), {
        status,
        updatedAt: now
      });

      // Restore stock when cancelling
      if (status === 'cancelled' && oldStatus !== 'cancelled') {
        for (const item of order.items || []) {
          const productRef = db.collection('products').doc(item.productId);
          const productDoc = await transaction.get(productRef);
          if (productDoc.exists) {
            const product = productDoc.data();
            const currentStock = product.stock || {};
            const updatedStock = { ...currentStock };
            const size = item.size;
            updatedStock[size] = (updatedStock[size] || 0) + item.quantity;
            transaction.update(productRef, { stock: updatedStock, updatedAt: now });
          }
        }
      }

      // Rededuct if un-cancelling
      if (oldStatus === 'cancelled' && status !== 'cancelled') {
        for (const item of order.items || []) {
          const productRef = db.collection('products').doc(item.productId);
          const productDoc = await transaction.get(productRef);
          if (productDoc.exists) {
            const product = productDoc.data();
            const currentStock = product.stock || {};
            const updatedStock = { ...currentStock };
            const size = item.size;
            const current = updatedStock[size] || 0;
            if (current < item.quantity) {
              throw new Error(`Not enough stock to reinstate order ${orderId}. ${product.name} size ${size} has ${current}, needs ${item.quantity}`);
            }
            updatedStock[size] = current - item.quantity;
            transaction.update(productRef, { stock: updatedStock, updatedAt: now });
          }
        }
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Failed to update order:', err);
    if (err.message.startsWith('Not enough')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to update order' });
  }
};
