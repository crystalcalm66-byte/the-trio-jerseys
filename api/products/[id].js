const { db } = require('../../lib/firebase');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const productId = req.query.id || (req.url || '').split('/').pop();

  try {
    const doc = await db.collection('products').doc(productId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Failed to fetch product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};
