const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    admin_avatar: String,
    admin_name: String,
    admin_password: String
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
