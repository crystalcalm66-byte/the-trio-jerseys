module.exports = (req, res) => {
  res.json({
    method: req.method,
    contentType: req.headers['content-type'],
    bodyType: typeof req.body,
    body: req.body,
    bodyLength: req.body ? (typeof req.body === 'string' ? req.body.length : JSON.stringify(req.body).length) : 0
  });
};
