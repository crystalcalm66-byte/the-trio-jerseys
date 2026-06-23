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

  try {
    await db.collection('orders').doc(orderId).update({
      status,
      updatedAt: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to update order:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
};
