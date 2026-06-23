const { adminGuard } = require('../lib/auth');
const cloudinary = require('cloudinary').v2;
const Busboy = require('busboy');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

    pending++;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'trio-jerseys',
        resource_type: 'image'
      },
      (err, result) => {
        if (err) {
          if (!hasError) {
            hasError = true;
            res.status(500).json({ error: 'Upload failed' });
          }
          return;
        }

        uploadedUrls.push(result.secure_url);
        pending--;

        if (pending === 0 && !hasError) {
          res.json({ urls: uploadedUrls });
        }
      }
    );

    file.on('error', () => {
      if (!hasError) {
        hasError = true;
        res.status(500).json({ error: 'Upload failed' });
      }
    });

    file.pipe(uploadStream);
  });

  busboy.on('error', () => {
    if (!hasError) {
      hasError = true;
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  req.pipe(busboy);
};
