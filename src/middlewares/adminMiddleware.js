const multer = require('multer');
const path = require('path');

const sessionAdmin = (req, res, next) => {
  if (req.session && req.session.admin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

const storageVideo = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/public/videos');
  },
  filename: function (req, file, cb) {
    const adminId = req.session.admin._id;
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFilename = `${adminId}-${Date.now()}.${fileExtension}`;

    cb(null, uniqueFilename);
  }
});

const storageImage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/public/images');
  },
  filename: function (req, file, cb) {
    const adminId = req.session.admin._id;
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFilename = `${adminId}-${Date.now()}.${fileExtension}`;

    cb(null, uniqueFilename);
  }
});

// Cấu hình lưu trữ cho mô hình
const storageModel = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/public/models');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Giữ nguyên tên và đuôi file
  }
});

const imageFilter = (req, file, cb) => {
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  allowedExtensions.includes(fileExtension) ? cb(null, true) : cb(new Error('Only image files are allowed!'), false);
};

const uploadVideo = multer({ storage: storageVideo }).single('vocabulary_video_link');
const uploadImage = multer({
  storage: storageImage,
  fileFilter: imageFilter,
  limits: { fileSize: 1024 * 1024 * 5 }
}).single('topic_image');
const uploadModel = multer({ storage: storageModel }).array('modelFiles', 10);

// Middleware để xử lý lỗi upload
const handleUploadImage = (req, res, next) => {
  uploadImage(req, res, (err) => {
    if (err) {
      req.uploadError = err.message;
      return next();
    }
    next();
  });
};

module.exports = {
  sessionAdmin,
  uploadVideo,
  uploadImage,
  handleUploadImage,
  uploadModel
}