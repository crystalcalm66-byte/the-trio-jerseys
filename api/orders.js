const { db } = require('../lib/firebase');
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { name, phone, city, address, notes, payment_method, transaction_id, items } = body;

  if (!name || !phone || !city || !address || !payment_method || !items || !items.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validMethods = ['cod', 'jazzcash', 'easypaisa'];
  if (!validMethods.includes(payment_method)) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }

  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    try {
      const productDoc = await db.collection('products').doc(item.product_id).get();
      if (!productDoc.exists) {
        return res.status(400).json({ error: `Product ${item.product_id} not found` });
      }
      const product = productDoc.data();
      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      orderItems.push({
        productId: item.product_id,
        productName: product.name,
        size: item.size,
        quantity: item.quantity,
        unitPrice: product.price
      });
    } catch (err) {
      return res.status(500).json({ error: `Error looking up product ${item.product_id}` });
    }
  }

  const shipping = subtotal >= 5000 ? 0 : 300;
  const total = subtotal + shipping;
  const orderId = 'TRIO-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  const now = new Date().toISOString();

  try {
    await db.collection('orders').doc(orderId).set({
      customerName: name,
      phone,
      city,
      address,
      notes: notes || '',
      paymentMethod: payment_method,
      transactionId: transaction_id || '',
      subtotal,
      shipping,
      total,
      status: 'placed',
      createdAt: now,
      updatedAt: now,
      items: orderItems
    });

    res.json({ orderId, subtotal, shipping, total });
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};
