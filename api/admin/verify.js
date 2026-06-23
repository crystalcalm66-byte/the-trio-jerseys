const { verifyToken } = require('../../lib/auth');

module.exports = (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const decoded = verifyToken(token);

  res.json({ valid: !!decoded });
};
