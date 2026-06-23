const { db } = require('../lib/firebase');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const snapshot = await db.collection('products')
      .orderBy('name', 'asc')
      .get();

    const products = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.stock) {
        data.stock = { S: 10, M: 10, L: 10, XL: 10 };
      }
      products.push({ id: doc.id, ...data });
    });

    products.sort((a, b) => (b.bestSeller === true ? 1 : 0) - (a.bestSeller === true ? 1 : 0));

    res.json(products);
  } catch (err) {
    console.error('Failed to fetch products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};
