const { adminGuard } = require('../lib/auth');
const { bucket } = require('../lib/firebase');
const Busboy = require('busboy');
const path = require('path');
const crypto = require('crypto');

module.exports = (req, res) => {
  if (!adminGuard(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadedUrls = [];
  let pending = 0;
  let hasError = false;

  let busboy;
  try {
    busboy = Busboy({ headers: req.headers, limits: { fileSize: 5 * 1024 * 1024, files: 4 } });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  busboy.on('file', (fieldname, file, info) => {
    if (hasError) return;

    const ext = path.extname(info.filename || '.jpg').toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!allowed.includes(ext)) {
      hasError = true;
      file.resume();
      return res.status(400).json({ error: 'Only image files (jpg, png, gif, webp) are allowed' });
    }

    const filename = Date.now() + '-' + crypto.randomBytes(4).toString('hex') + ext;
    const blob = bucket.file('uploads/' + filename);
    const blobStream = blob.createWriteStream({
      metadata: { contentType: info.mimeType || 'image/jpeg' }
    });

    pending++;

    blobStream.on('error', (err) => {
      if (hasError) return;
      hasError = true;
      res.status(500).json({ error: 'Upload failed' });
    });

    blobStream.on('finish', async () => {
      try {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${filename}`;
        uploadedUrls.push(publicUrl);
      } catch {
        uploadedUrls.push(`https://storage.googleapis.com/${bucket.name}/uploads/${filename}`);
      }

      pending--;
      if (pending === 0 && !hasError) {
        res.json({ urls: uploadedUrls });
      }
    });

    file.pipe(blobStream);
  });

  busboy.on('filesLimit', () => {
    if (pending === 0 && !hasError) {
      res.json({ urls: uploadedUrls });
    }
  });

  busboy.on('error', () => {
    if (!hasError) {
      hasError = true;
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  req.pipe(busboy);
};
