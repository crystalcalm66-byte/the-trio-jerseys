const { db } = require('../../lib/firebase');
const { adminGuard } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (!adminGuard(req, res)) return;
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { status } = req.query || {};

  try {
    let query = db.collection('orders').orderBy('createdAt', 'desc');

    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const orders = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        customerName: data.customerName,
        phone: data.phone,
        city: data.city,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        subtotal: data.subtotal,
        shipping: data.shipping,
        total: data.total,
        status: data.status,
        createdAt: data.createdAt,
        items: data.items || []
      });
    });

    res.json(orders);
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};
