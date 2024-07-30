const express = require('express');

const router = express.Router();

const adminController = require('../controllers/adminController');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Route để get đăng nhập
router.get('/login', adminController.getLoginAdmin);

// Route để post đăng nhập
router.post('/login-admin', adminController.postLoginAdmin);

// Route để get đăng xuất
router.get('/logout', adminMiddleware.sessionAdmin, adminController.getLogoutAdmin);

// Route để get admin index 
router.get('/index', adminMiddleware.sessionAdmin, adminController.getIndexAdmin);

// Route để get thông tin profile
router.get('/admin-profile', adminMiddleware.sessionAdmin, adminController.getProfileAdmin);

// Route để get danh sách từ vựng
router.get('/list-vocabulary', adminMiddleware.sessionAdmin, adminController.getListVocabulary);

// Route để hiển thị chi tiết từng vựng theo ID  ==> DONE
router.get('/vocabulary-detail/:vocabularyID', adminMiddleware.sessionAdmin, adminController.getVocabularyDetailByID);

// Route để get data từ vựng theo ID ==> rồi đưa vô EDIT modal  ==> DONE
router.post('/list-vocabulary/:vocabularyID', adminMiddleware.sessionAdmin, adminController.postVocabularyByID);

// Route để post thêm từ vựng
router.post('/add-vocabulary', adminMiddleware.sessionAdmin, adminMiddleware.uploadVideo, adminController.postAddVocabulary);

// Route để put chỉnh sửa từ vựng
router.put('/edit-vocabulary/:vocabularyID', adminMiddleware.sessionAdmin, adminMiddleware.uploadVideo, adminController.putEditVocabulary);

// Route để delete xóa từ vựng
router.delete('/delete-vocabulary/:vocabularyID', adminMiddleware.sessionAdmin, adminController.deleteDeleteVocabulary);

// Route để get danh sách từ vựng phê duyệt
router.get('/list-recommendation-vocabulary', adminMiddleware.sessionAdmin, adminController.getListRecommendationVocabulary);

// Route để put thay đổi thông tin từ vựng phê duyệt
router.get('/change-recommendation-vocabulary/:vocabularyID', adminMiddleware.sessionAdmin, adminController.putChangeRecommendationVocabulary);

// Route để get danh sách chủ đề
router.get('/list-topic', adminMiddleware.sessionAdmin, adminController.getListTopic);

// Route để lấy thông tin topic theo ID  ==> Đưa vô EDIT MODAL
router.get('/topic/:topicID', adminMiddleware.sessionAdmin, adminController.getTopicByID);

// Route để hiện thị chi tiết chủ đề theo ID ==> DONE
router.get('/details-topic/:topicID', adminMiddleware.sessionAdmin, adminController.getDetailTopicByID);

// Route để post thêm chủ đề
router.post('/add-topic', adminMiddleware.sessionAdmin, adminMiddleware.uploadImage, adminController.postAddTopic);

// Route để put thay đổi chủ đề
router.put('/edit-topic/:topicID', adminMiddleware.sessionAdmin, adminMiddleware.uploadImage, adminController.putEditTopic);

// Route để delete xóa chủ đề
router.delete('/delete-topic/:topicID', adminMiddleware.sessionAdmin, adminController.deleteDeleteTopic);

// Route để get danh sách user
router.get('/list-user', adminMiddleware.sessionAdmin, adminController.getListUser);

// Route để get danh sách user
router.get('/list-detail-user/:userID', adminMiddleware.sessionAdmin, adminController.getListDetailUser);

// Route để post thêm chủ đề
router.post('/change-status-user/:userID', adminMiddleware.sessionAdmin, adminController.postChangeStatusUser);

// Route để get upload model
router.get('/upload-model', adminMiddleware.sessionAdmin, adminController.getUploadModel);

// Route để post upload model
router.post('/upload-model', adminMiddleware.sessionAdmin, adminMiddleware.uploadModel, adminController.postUploadModel);

module.exports = router;
