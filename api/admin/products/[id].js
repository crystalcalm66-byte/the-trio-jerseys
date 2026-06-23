const { db } = require('../../../lib/firebase');
const { adminGuard } = require('../../../lib/auth');

module.exports = async (req, res) => {
  if (!adminGuard(req, res)) return;

  const productId = req.query.id || (req.url || '').split('/').pop();

  if (req.method === 'PUT') {
    const body = (typeof req.body === 'object' ? req.body : {});
    const { name, club, country, category, price, description, sizes, outOfStockSizes, bestSeller, images, stock } = body;

    try {
      const doc = await db.collection('products').doc(productId).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const existing = doc.data();
      const update = {
        name: name ?? existing.name,
        club: club !== undefined ? club : existing.club,
        country: country !== undefined ? country : existing.country,
        category: category ?? existing.category,
        price: price !== undefined ? Number(price) : existing.price,
        description: description ?? existing.description,
        images: images || existing.images,
        sizes: sizes || existing.sizes,
        stock: stock !== undefined ? stock : existing.stock,
        outOfStockSizes: outOfStockSizes || existing.outOfStockSizes || [],
        bestSeller: bestSeller !== undefined ? bestSeller : existing.bestSeller,
        updatedAt: new Date().toISOString()
      };

      await db.collection('products').doc(productId).update(update);

      const updated = await db.collection('products').doc(productId).get();
      res.json({ id: updated.id, ...updated.data() });
    } catch (err) {
      console.error('Failed to update product:', err);
      res.status(500).json({ error: 'Failed to update product' });
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      await db.collection('products').doc(productId).delete();
      res.json({ success: true });
    } catch (err) {
      console.error('Failed to delete product:', err);
      res.status(500).json({ error: 'Failed to delete product' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
