const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory path: uploads/appointments/{appointmentId}/temp
    // Category (pre/post) will be determined after upload based on appointment time
    const appointmentId = req.params.appointmentId;

    if (!appointmentId) {
      return cb(new Error('Appointment ID is required'), null);
    }

    const uploadPath = path.join(__dirname, '..', 'uploads', 'appointments', appointmentId);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: uuid + original extension
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueFilename = `${crypto.randomUUID()}${ext}`;

    // Store original filename in request for later use
    req.originalFilename = file.originalname;

    cb(null, uniqueFilename);
  }
});

// File filter function
const fileFilter = function (req, file, cb) {
  // Allowed file types
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];

  // Get file extension
  const ext = path.extname(file.originalname).toLowerCase();

  // Check MIME type and extension
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only PDF, JPG, and PNG files are allowed. Received: ${file.mimetype}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum size is 10 MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

module.exports = {
  upload,
  handleMulterError
};
