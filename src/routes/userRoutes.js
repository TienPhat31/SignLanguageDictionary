const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');
const userMiddleware = require('../middlewares/userMiddleware');

// Route để get đăng ký  ==> DONE
router.get('/register', userController.getRegisterUser);

// Route để post đăng ký  ==> DONE
router.post('/register', userController.postRegisterUser);

// Route để xác nhận email ==> DONE
router.get('/verify-email-token/:token', userController.getVerifyEmailTokenUser);

// Route để get đăng nhập  ==> DONE
router.get('/login', userController.getLoginUser);

// Route để post đăng nhập  ==> DONE
router.post('/login', userController.postLoginUser);

// Router để đổi mật khẩu người dùng ==> DONE
router.post('/change-password', userMiddleware.sessionBlockUser, userController.changePassword)

// Route để get chặn khi người dùng bị khóa ==> DONE
router.get('/locked-status', userMiddleware.sessionBlockUser, userController.getLockedStatusUser);

// Route để get trang tin tuc ==> DONE
router.get('/news', userMiddleware.sessionBlockUser, userController.getNewsPage);

// Route để get chặn khi người dùng chưa xác nhận email
router.get('/resend-email', userMiddleware.sessionBlockUser, userController.getResendEmailUser);

// Route để post gửi lại email xác nhận cho người dùng
router.post('/resend-email', userMiddleware.sessionBlockUser, userController.postResendEmailUser);

// Route để get đăng xuất  ==>
router.get('/logout', userMiddleware.sessionUser, userController.getLogoutUser);

// Route để get trang chủ  ==> DONE
router.get('/home', userMiddleware.sessionUser, userController.getHomePage);

// Route để get danh sách từ vựng theo BẢNG CHỮ CÁI ===> DONE
router.get('/list-vocabulary-alphabet', userMiddleware.sessionUser, userController.getListVocabularyAlphabet);

// Route để get danh sách từ vựng  ===> DONE
router.get('/list-vocabulary', userMiddleware.sessionUser, userController.getListVocabulary);

// Route để get danh sách từ vựng tập luyện theo AI
router.get('/profile/:id', userMiddleware.sessionUser, userController.getProfileUser);

// Route để get danh sách từ vựng đã đươc SORTED theo Difficult levels  ===> DONE
router.get('/test', userController.getListVocabularySorted)

// Route để get chi tiết từ vựng
router.get('/detail-vocabulary/:id', userMiddleware.sessionUser, userController.getDetailVocabulary);

// Route để get danh sách tất cả chủ đề ==> DONE
router.get('/topic', userMiddleware.sessionUser, userController.getListTopic);

// Route để get danh sách chủ đề độ khó
router.get('/list-difficulty-level', userMiddleware.sessionUser, userController.getListDifficultyLevel);

// Route để get các từ vựng trong chủ đề
router.get('/list-vocabulary-topic/:id', userMiddleware.sessionUser, userController.getListVocabularyTopic);

// Route để get các từ vựng trong theo chữ cái
router.get('/list-vocabulary-letter/:letter', userMiddleware.sessionUser, userController.getListVocabularyLetter);

// Route để get các từ vựng trong chủ đề độ khó
router.get('/list-vocabulary-difficulty-level/:level', userMiddleware.sessionUser, userController.getListVocabularyDifficultyLevel);

// Route để post danh sách từ vựng yêu thích
router.post('/add-vocabulary-user', userMiddleware.sessionUser, userController.postAddVocabularyUser);

// Route để get danh sách từ vựng yêu thích
router.get('/list-favorite-vocabulary', userMiddleware.sessionUser, userController.getListFavorite);

// Route để get danh sách từ vựng tập luyện
router.get('/list-practice', userMiddleware.sessionUser, userController.getListPractice);

// Route để post danh sách từ vựng tập luyện
router.post('/list-practice', userMiddleware.sessionUser, userController.postListPractice);

// Route để get danh sách từ vựng
router.post('/add-recommendation-vocabulary', userMiddleware.sessionUser, userController.postAddRecommendationVocabulary);

// Route để get danh sách từ vựng
router.post('/list-recommendation-vocabulary', userMiddleware.sessionUser, userController.getListRecommendationVocabulary);

// Router để get trang liên hệ 
router.get("/contact-us", userMiddleware.sessionUser, userController.getContact)

// Route để get danh sách từ vựng tập luyện
router.get('/list-practice', userMiddleware.sessionUser, userController.getListPractice);

// Route để thi kết quả luyện tập
router.post('/result-practice', userMiddleware.sessionUser, userController.postListPractice);

// Route để get danh sách từ vựng tập luyện theo AI
router.get('/list-practice-ai', userMiddleware.sessionUser, userController.getListPracticeAI);

// Route để get danh sách từ vựng tập luyện theo AI
router.get('/detail-vocabulary-ai', userMiddleware.sessionUser, userController.getDetailVocabularyAI);


module.exports = router;
