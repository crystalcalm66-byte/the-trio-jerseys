const { signToken, ADMIN_PASSWORD } = require('../../lib/auth');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = (typeof req.body === 'object' ? req.body : {});
  const { password } = body;

  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = signToken();
  res.json({ success: true, token });
};
