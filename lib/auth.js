const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default-dev-secret-change-in-production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function signToken() {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function adminGuard(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return decoded;
}

function parseJSON(req) {
  return new Promise((resolve) => {
    if (req.body) {
      if (typeof req.body === 'object') return resolve(req.body);
      try { return resolve(JSON.parse(req.body)); } catch { return resolve({}); }
    }
    let data = '';
    let resolved = false;
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      if (resolved) return;
      resolved = true;
      try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); }
    });
    setTimeout(() => {
      if (!resolved) { resolved = true; resolve({}); }
    }, 5000);
  });
}

module.exports = { signToken, verifyToken, adminGuard, parseJSON, ADMIN_PASSWORD };
