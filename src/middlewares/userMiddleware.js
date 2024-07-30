const multer = require('multer');
const path = require('path');

const sessionUser = (req, res, next) => {
  if (req.session && req.session.user) {
    if (req.session.user.status_user === false) {
      return res.redirect('/user/locked-status');
    } else if (req.session.user.check_email_confirmation === false) {
      return res.redirect('/user/resend-email');
    } else {
      next();
    }
  } else {
    return res.redirect('/user/login');
  }
};

const sessionBlockUser = (req, res, next) => {
  if (req.session && req.session.user) {
    next()
  } else {
    return res.redirect('/404');
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/public/images');
  },
  filename: function (req, file, cb) {
    const userId = req.session.user._id;
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFilename = 'avatar_user_' + userId + '.' + fileExtension;

    cb(null, uniqueFilename);
  }
});

const upload = multer({ storage: storage });

module.exports = {
  sessionUser,
  sessionBlockUser,
  upload,
}