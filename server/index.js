require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { initDatabase, getDb, saveDb } = require('./db');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    var ext = path.extname(file.originalname) || '.jpg';
    var name = Date.now() + '-' + Math.random().toString(36).slice(2, 6) + ext;
    cb(null, name);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    var allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    var ext = path.extname(file.originalname).toLowerCase();
    if (allowed.indexOf(ext) > -1) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
    }
  }
});

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/admin', (req, res, next) => {
  if (req.path === '/login.html') {
    return next();
  }
  if (!req.session.isAdmin) {
    return res.redirect('/admin/login.html?redirect=' + encodeURIComponent(req.originalUrl));
  }
  next();
});

app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, '..')));

function adminApiGuard(req, res, next) {
  if (!req.session.isAdmin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ---- HELPERS ----

function formatProduct(p) {
  return {
    id: p[0],
    name: p[1],
    club: p[2],
    country: p[3],
    category: p[4],
    price: p[5],
    description: p[6],
    images: JSON.parse(p[7]),
    sizes: JSON.parse(p[8]),
    outOfStockSizes: JSON.parse(p[9]),
    bestSeller: !!p[10]
  };
}

function productToObject(row) {
  return {
    id: row[0], name: row[1], club: row[2], country: row[3],
    category: row[4], price: row[5], description: row[6],
    images: row[7], available_sizes: row[8], out_of_stock_sizes: row[9],
    best_seller: row[10]
  };
}

// ---- PUBLIC API ----

app.get('/api/products', (req, res) => {
  const db = getDb();
  const results = db.exec('SELECT * FROM products ORDER BY best_seller DESC, name ASC');
  const rows = results.length > 0 ? results[0].values : [];
  res.json(rows.map(formatProduct));
});

app.get('/api/products/:id', (req, res) => {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  stmt.bind([req.params.id]);
  const row = [];
  while (stmt.step()) {
    row.push(stmt.getAsObject());
  }
  stmt.free();
  if (row.length === 0) return res.status(404).json({ error: 'Product not found' });
  res.json(formatProduct(Object.values(row[0])));
});

app.post('/api/orders', (req, res) => {
  const { name, phone, city, address, notes, payment_method, transaction_id, items } = req.body;

  if (!name || !phone || !city || !address || !payment_method || !items || !items.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validMethods = ['cod', 'jazzcash', 'easypaisa'];
  if (!validMethods.includes(payment_method)) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }

  const db = getDb();
  const orderId = 'TRIO-' + crypto.randomBytes(3).toString('hex').toUpperCase();

  let subtotal = 0;
  const itemRows = [];

  for (const item of items) {
    const stmt = db.prepare('SELECT price, name FROM products WHERE id = ?');
    stmt.bind([item.product_id]);
    let product = null;
    while (stmt.step()) {
      product = stmt.getAsObject();
    }
    stmt.free();

    if (!product) {
      return res.status(400).json({ error: `Product ${item.product_id} not found` });
    }

    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    itemRows.push({
      product_id: item.product_id,
      product_name: product.name,
      size: item.size,
      quantity: item.quantity,
      unit_price: product.price
    });
  }

  const shipping = subtotal >= 5000 ? 0 : 300;
  const total = subtotal + shipping;

  try {
    db.run('BEGIN TRANSACTION');

    db.run(
      'INSERT INTO orders (id, customer_name, phone, city, address, notes, payment_method, transaction_id, subtotal, shipping, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [orderId, name, phone, city, address, notes || '', payment_method, transaction_id || '', subtotal, shipping, total, 'placed']
    );

    const itemStmt = db.prepare('INSERT INTO order_items (order_id, product_id, product_name, size, quantity, unit_price) VALUES (?, ?, ?, ?, ?, ?)');
    for (const row of itemRows) {
      itemStmt.run([orderId, row.product_id, row.product_name, row.size, row.quantity, row.unit_price]);
    }
    itemStmt.free();

    db.run('COMMIT');
    saveDb();

    res.json({ orderId, subtotal, shipping, total });
  } catch (err) {
    db.run('ROLLBACK');
    console.error('Order creation failed:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders/:id', (req, res) => {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
  stmt.bind([req.params.id]);
  let order = null;
  while (stmt.step()) {
    order = stmt.getAsObject();
  }
  stmt.free();

  if (!order) return res.status(404).json({ error: 'Order not found' });

  const itemStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  itemStmt.bind([order.id]);
  const items = [];
  while (itemStmt.step()) {
    items.push(itemStmt.getAsObject());
  }
  itemStmt.free();

  res.json({
    id: order.id,
    customerName: order.customer_name,
    phone: order.phone,
    city: order.city,
    address: order.address,
    notes: order.notes,
    paymentMethod: order.payment_method,
    transactionId: order.transaction_id,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    status: order.status,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: items.map(item => ({
      productId: item.product_id,
      productName: item.product_name,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.unit_price
    }))
  });
});

// ---- ADMIN API ----

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  if (bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    req.session.isAdmin = true;
    return res.json({ success: true });
  }

  res.status(401).json({ error: 'Invalid password' });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/admin/orders', adminApiGuard, (req, res) => {
  const db = getDb();
  const { status } = req.query;
  let results;

  if (status && status !== 'all') {
    const stmt = db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC');
    stmt.bind([status]);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    results = rows;
  } else {
    const stmt = db.prepare('SELECT * FROM orders ORDER BY created_at DESC');
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    results = rows;
  }

  const result = results.map(order => {
    const itemStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    itemStmt.bind([order.id]);
    const items = [];
    while (itemStmt.step()) {
      items.push(itemStmt.getAsObject());
    }
    itemStmt.free();

    return {
      id: order.id,
      customerName: order.customer_name,
      phone: order.phone,
      city: order.city,
      paymentMethod: order.payment_method,
      transactionId: order.transaction_id,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      status: order.status,
      createdAt: order.created_at,
      items
    };
  });

  res.json(result);
});

app.put('/api/admin/orders/:id', adminApiGuard, (req, res) => {
  const db = getDb();
  const { status } = req.body;
  const validStatuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?", [status, req.params.id]);
  saveDb();

  res.json({ success: true });
});

app.get('/api/admin/products', adminApiGuard, (req, res) => {
  const db = getDb();
  const results = db.exec('SELECT * FROM products ORDER BY name ASC');
  const rows = results.length > 0 ? results[0].values : [];
  res.json(rows.map(formatProduct));
});

app.post('/api/admin/products', adminApiGuard, (req, res) => {
  const db = getDb();
  const { name, club, country, category, price, description, sizes } = req.body;

  if (!name || !category || !price) {
    return res.status(400).json({ error: 'Name, category, and price are required' });
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) + '-' + Math.random().toString(36).slice(2, 6);

  db.run(
    'INSERT INTO products (id, name, club, country, category, price, description, images, available_sizes, out_of_stock_sizes, best_seller) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
    [
      id, name, club || null, country || null, category, price,
      description || '',
      JSON.stringify([
        `https://picsum.photos/seed/${id}-1/600/800`,
        `https://picsum.photos/seed/${id}-2/600/800`,
        `https://picsum.photos/seed/${id}-3/600/800`,
        `https://picsum.photos/seed/${id}-4/600/800`
      ]),
      JSON.stringify(sizes || ['S', 'M', 'L', 'XL']),
      '[]'
    ]
  );
  saveDb();

  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  stmt.bind([id]);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();

  res.json(formatProduct(Object.values(rows[0])));
});

app.put('/api/admin/products/:id', adminApiGuard, (req, res) => {
  const db = getDb();
  const { name, club, country, category, price, description, sizes, outOfStockSizes, bestSeller, images } = req.body;

  const check = db.prepare('SELECT * FROM products WHERE id = ?');
  check.bind([req.params.id]);
  let exists = false;
  while (check.step()) { exists = true; }
  check.free();

  if (!exists) return res.status(404).json({ error: 'Product not found' });

  const existing = db.exec('SELECT * FROM products WHERE id = \'' + req.params.id + '\'');
  const existingRow = existing.length > 0 && existing[0].values.length > 0 ? existing[0].values[0] : null;
  if (!existingRow) return res.status(404).json({ error: 'Product not found' });

  db.run(
    'UPDATE products SET name = ?, club = ?, country = ?, category = ?, price = ?, description = ?, images = ?, available_sizes = ?, out_of_stock_sizes = ?, best_seller = ? WHERE id = ?',
    [
      name ?? existingRow[1],
      club !== undefined ? club : existingRow[2],
      country !== undefined ? country : existingRow[3],
      category ?? existingRow[4],
      price ?? existingRow[5],
      description ?? existingRow[6],
      images ? JSON.stringify(images) : existingRow[7],
      sizes ? JSON.stringify(sizes) : existingRow[8],
      outOfStockSizes ? JSON.stringify(outOfStockSizes) : existingRow[9],
      bestSeller !== undefined ? (bestSeller ? 1 : 0) : existingRow[10],
      req.params.id
    ]
  );
  saveDb();

  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  stmt.bind([req.params.id]);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();

  res.json(formatProduct(Object.values(rows[0])));
});

app.delete('/api/admin/products/:id', adminApiGuard, (req, res) => {
  const db = getDb();
  db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
  saveDb();
  res.json({ success: true });
});

// ---- UPLOAD ----

app.post('/api/upload', adminApiGuard, upload.array('images', 4), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const urls = req.files.map(function(f) {
    return '/uploads/' + f.filename;
  });
  res.json({ urls: urls });
});

app.use(function(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max 5MB per image.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// ---- START ----

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`The Trio Jerseys server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
