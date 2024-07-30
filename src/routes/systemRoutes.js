const express = require('express');

const router = express.Router();

const adminController = require('../controllers/adminController');
const adminMiddleware = require('../middlewares/adminMiddleware');

module.exports = router;
