const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// configure cloudinary using server-side env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadImageFromBuffer = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) return res.status(400).json({ ok: false, message: 'No file uploaded' });

    const opts = { folder: 'skillup_images' };
    const uploadStream = cloudinary.uploader.upload_stream(opts, (error, result) => {
      if (error) return next(error);
      return res.json({ ok: true, secure_url: result.secure_url, raw: result });
    });

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (e) {
    next(e);
  }
};
