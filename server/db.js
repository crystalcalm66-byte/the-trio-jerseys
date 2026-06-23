const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'trio.db');
let db;

async function initDatabase() {
  const SQL = await initSqlJs();

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');
  initSchema();
  seedIfEmpty();
  saveDb();

  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function initSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      club TEXT,
      country TEXT,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      images TEXT NOT NULL DEFAULT '[]',
      available_sizes TEXT NOT NULL DEFAULT '["S","M","L","XL"]',
      out_of_stock_sizes TEXT NOT NULL DEFAULT '[]',
      best_seller INTEGER NOT NULL DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      notes TEXT DEFAULT '',
      payment_method TEXT NOT NULL,
      transaction_id TEXT DEFAULT '',
      subtotal INTEGER NOT NULL,
      shipping INTEGER NOT NULL,
      total INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'placed',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL REFERENCES orders(id),
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price INTEGER NOT NULL
    )
  `);
}

function seedIfEmpty() {
  const count = db.exec('SELECT COUNT(*) as c FROM products');
  const rows = count.length > 0 ? count[0].values : [];
  if (rows.length > 0 && rows[0][0] > 0) return;

  const stmt = db.prepare(`
    INSERT INTO products (id, name, club, country, category, price, description, images, available_sizes, out_of_stock_sizes, best_seller)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const products = [
    {
      id: 'rm', name: 'Real Madrid 2024-25', club: 'Real Madrid', country: null,
      category: 'Clubs', price: 3999, bestSeller: true,
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']), oos: JSON.stringify(['S', 'XL']),
      desc: 'The iconic white jersey of the most successful club in European football history. Features the classic clean design with modern moisture-wicking fabric for ultimate comfort on matchday.',
      images: JSON.stringify(['https://picsum.photos/seed/rm-1/600/800','https://picsum.photos/seed/rm-2/600/800','https://picsum.photos/seed/rm-3/600/800','https://picsum.photos/seed/rm-4/600/800'])
    },
    {
      id: 'mc', name: 'Manchester City 2024-25', club: 'Manchester City', country: null,
      category: 'Clubs', price: 3799, bestSeller: true,
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']), oos: '[]',
      desc: 'Rep the Premier League champions in this sky-blue masterpiece. Designed with lightweight, breathable fabric that keeps you cool whether you are in the stands or on the pitch.',
      images: JSON.stringify(['https://picsum.photos/seed/mc-1/600/800','https://picsum.photos/seed/mc-2/600/800','https://picsum.photos/seed/mc-3/600/800','https://picsum.photos/seed/mc-4/600/800'])
    },
    {
      id: 'liv', name: 'Liverpool 2024-25', club: 'Liverpool', country: null,
      category: 'Clubs', price: 3499, bestSeller: false,
      sizes: JSON.stringify(['S', 'M', 'L']), oos: '[]',
      desc: 'The iconic all-red jersey of Liverpool FC. You will never walk alone in this premium replica that captures the spirit of Anfield.',
      images: JSON.stringify(['https://picsum.photos/seed/liv-1/600/800','https://picsum.photos/seed/liv-2/600/800','https://picsum.photos/seed/liv-3/600/800','https://picsum.photos/seed/liv-4/600/800'])
    },
    {
      id: 'bay', name: 'Bayern Munich 2024-25', club: 'Bayern Munich', country: null,
      category: 'Clubs', price: 3699, bestSeller: true,
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']), oos: '[]',
      desc: 'Die Mannschaft in all-red. The German champions bring a sleek, modern design with superior fabric quality and attention to detail.',
      images: JSON.stringify(['https://picsum.photos/seed/bay-1/600/800','https://picsum.photos/seed/bay-2/600/800','https://picsum.photos/seed/bay-3/600/800','https://picsum.photos/seed/bay-4/600/800'])
    },
    {
      id: 'psg', name: 'PSG 2024-25', club: 'PSG', country: null,
      category: 'Clubs', price: 4299, bestSeller: false,
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']), oos: '[]',
      desc: 'Parisian elegance meets football performance. The dark navy jersey with subtle detailing is a statement piece for any fan of the Parisian club.',
      images: JSON.stringify(['https://picsum.photos/seed/psg-1/600/800','https://picsum.photos/seed/psg-2/600/800','https://picsum.photos/seed/psg-3/600/800','https://picsum.photos/seed/psg-4/600/800'])
    },
    {
      id: 'bar', name: 'Barcelona 2024-25', club: 'Barcelona', country: null,
      category: 'Clubs', price: 3899, bestSeller: true,
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']), oos: '[]',
      desc: 'Mes que un club. The famous Blaugrana stripes in a premium player-version cut, celebrating the rich heritage of FC Barcelona.',
      images: JSON.stringify(['https://picsum.photos/seed/bar-1/600/800','https://picsum.photos/seed/bar-2/600/800','https://picsum.photos/seed/bar-3/600/800','https://picsum.photos/seed/bar-4/600/800'])
    },
    {
      id: 'bra', name: 'Brazil 2024-25', club: null, country: 'Brazil',
      category: 'National Teams', price: 4499, bestSeller: true,
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']), oos: '[]',
      desc: 'O jogo bonito. The famous canarinho yellow that has graced the greatest players in football history. A must-have for any football fan.',
      images: JSON.stringify(['https://picsum.photos/seed/bra-1/600/800','https://picsum.photos/seed/bra-2/600/800','https://picsum.photos/seed/bra-3/600/800','https://picsum.photos/seed/bra-4/600/800'])
    },
    {
      id: 'arg', name: 'Argentina 2024-25', club: null, country: 'Argentina',
      category: 'National Teams', price: 4999, bestSeller: true,
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']), oos: '[]',
      desc: 'The iconic Albiceleste stripes of the World Champions. Wear the same design as Messi and the champions of the world.',
      images: JSON.stringify(['https://picsum.photos/seed/arg-1/600/800','https://picsum.photos/seed/arg-2/600/800','https://picsum.photos/seed/arg-3/600/800','https://picsum.photos/seed/arg-4/600/800'])
    },
    {
      id: 'fra', name: 'France 2024-25', club: null, country: 'France',
      category: 'National Teams', price: 4299, bestSeller: false,
      sizes: JSON.stringify(['S', 'M', 'L']), oos: '[]',
      desc: 'Les Bleus. The elegant deep blue of the French national team, featuring subtle tonal detailing that sets it apart from the rest.',
      images: JSON.stringify(['https://picsum.photos/seed/fra-1/600/800','https://picsum.photos/seed/fra-2/600/800','https://picsum.photos/seed/fra-3/600/800','https://picsum.photos/seed/fra-4/600/800'])
    },
    {
      id: 'pak', name: 'Pakistan 2024-25', club: null, country: 'Pakistan',
      category: 'National Teams', price: 2499, bestSeller: true,
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']), oos: '[]',
      desc: 'Represent the Green Shirts with pride. The Pakistan national team jersey in a premium quality that celebrates our nations passion for football.',
      images: JSON.stringify(['https://picsum.photos/seed/pak-1/600/800','https://picsum.photos/seed/pak-2/600/800','https://picsum.photos/seed/pak-3/600/800','https://picsum.photos/seed/pak-4/600/800'])
    },
    {
      id: 'ger', name: 'Germany 2024-25', club: null, country: 'Germany',
      category: 'National Teams', price: 3999, bestSeller: false,
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']), oos: '[]',
      desc: 'Die Nationalmannschaft. The classic white and black of German football, engineered for performance and style.',
      images: JSON.stringify(['https://picsum.photos/seed/ger-1/600/800','https://picsum.photos/seed/ger-2/600/800','https://picsum.photos/seed/ger-3/600/800','https://picsum.photos/seed/ger-4/600/800'])
    },
    {
      id: 'por', name: 'Portugal 2024-25', club: null, country: 'Portugal',
      category: 'National Teams', price: 4499, bestSeller: false,
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']), oos: '[]',
      desc: 'A selecao. The vibrant red and green of Portugal, inspired by the nations flag and worn by some of the greatest talents in the game.',
      images: JSON.stringify(['https://picsum.photos/seed/por-1/600/800','https://picsum.photos/seed/por-2/600/800','https://picsum.photos/seed/por-3/600/800','https://picsum.photos/seed/por-4/600/800'])
    }
  ];

  for (const p of products) {
    stmt.run([p.id, p.name, p.club, p.country, p.category, p.price, p.desc, p.images, p.sizes, p.oos, p.bestSeller ? 1 : 0]);
  }
  stmt.free();
}

module.exports = { initDatabase, getDb, saveDb };
