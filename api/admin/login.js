const { signToken, ADMIN_PASSWORD, parseJSON } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = await parseJSON(req);
  const { password } = body;

  if (!password) {
    return res.status(401).json({ error: 'No password', bodyType: typeof req.body, bodyIsObj: req.body && typeof req.body === 'object', bodyVal: JSON.stringify(body).slice(0, 100) });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  const token = signToken();
  res.json({ success: true, token });
};
