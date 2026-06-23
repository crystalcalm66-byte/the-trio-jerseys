const { db } = require('../../lib/firebase');
const { adminGuard } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (!adminGuard(req, res)) return;

  if (req.method === 'GET') {
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

      return res.json(products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  if (req.method === 'POST') {
    const body = (typeof req.body === 'object' ? req.body : {});
    const { name, club, country, category, price, description, sizes } = body;

    if (!name || !category || price === undefined || price === null) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20)
      + '-' + Math.random().toString(36).slice(2, 6);

    const now = new Date().toISOString();

    const product = {
      name,
      club: club || null,
      country: country || null,
      category,
      price: Number(price),
      description: description || '',
      images: [
        `https://picsum.photos/seed/${id}-1/600/800`,
        `https://picsum.photos/seed/${id}-2/600/800`,
        `https://picsum.photos/seed/${id}-3/600/800`,
        `https://picsum.photos/seed/${id}-4/600/800`
      ],
      sizes: sizes || ['S', 'M', 'L', 'XL'],
      stock: { S: 10, M: 10, L: 10, XL: 10 },
      outOfStockSizes: [],
      bestSeller: false,
      createdAt: now,
      updatedAt: now
    };

    try {
      await db.collection('products').doc(id).set(product);
      return res.json({ id, ...product });
    } catch (err) {
      console.error('Failed to create product:', err);
      return res.status(500).json({ error: 'Failed to create product' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
