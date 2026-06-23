const { db } = require('../../lib/firebase');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const orderId = req.query.id || (req.url || '').split('/').pop();

  try {
    const doc = await db.collection('orders').doc(orderId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = doc.data();
    res.json({
      id: doc.id,
      customerName: order.customerName,
      phone: order.phone,
      city: order.city,
      address: order.address,
      notes: order.notes,
      paymentMethod: order.paymentMethod,
      transactionId: order.transactionId,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items || []
    });
  } catch (err) {
    console.error('Failed to fetch order:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};
