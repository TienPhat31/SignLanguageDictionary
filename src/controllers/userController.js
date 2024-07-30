const crypto = require('crypto');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const _ = require('lodash');
const bcrypt = require('bcrypt');
require('dotenv').config();
const Admin = require('../models/adminModel');
const Topic = require('../models/topicModel');
const User = require('../models/userModel');
const Vocabulary = require('../models/vocabularyModel');
const VocabularyTopic = require('../models/vocabularyTopicModel');
const VocabularyUser = require('../models/vocabularyUserModel');

// Hiển thị form đăng ký  ==> DONE
const getRegisterUser = async (req, res) => {
    try {
        res.render('user/user_Register');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Gửi thông tin đăng ký ==> DONE
const postRegisterUser = async (req, res) => {
    try {
        const { fullName, password, confirmPassword, email } = req.body;
        if (password !== confirmPassword) {
            req.flash('error', 'Password and Confirm Password do not match');
            return res.redirect('/user/register');
        }

        const existingUser = await User.findOne({ user_email: email });
        if (existingUser) {
            req.flash('error', 'The user already exists in the system');
            return res.redirect('/user/register');
        }

        const name = email.split('@')[0];

        const token = crypto.randomBytes(20).toString('hex');
        const tokenExpiration = Date.now() + 60000;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            user_avatar: '/images/avatar_user.jpg',
            user_full_name: fullName,
            user_email: email,
            user_name: name,
            user_password: hashedPassword,
            user_status: true,
            check_email_confirmation: false,
            email_verification_token: token,
            email_verification_token_expiration: tokenExpiration,
        });

        await newUser.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.PASS_EMAIL,
            },
        });

        const currentURL = req.protocol + '://' + req.get('host');

        const mailOptions = {
            from: 'Sign Language System',
            to: email,
            subject: 'Account Registration Verification',
            html: `
                <p>Hello ${fullName},</p>
                <p>Please click on the following link to verify your account registration:</p>
                <a href="${currentURL}/user/verify-email-token/${token}">Verify Account</a>
            `,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        req.flash('success', 'User account successfully created. Verification email has been sent to user');
        return res.redirect('/user/register');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Xác thực email token  ==> DONE
const getVerifyEmailTokenUser = async (req, res) => {
    const { token } = req.params;

    try {
        const userMember = await User.findOne({
            email_verification_token: token,
            email_verification_token_expiration: { $gt: Date.now() },
        });

        if (!userMember) {
            req.flash('error', 'The token link has expired');
            return res.redirect('/user/login');
        }

        userMember.check_email_confirmation = true;
        await userMember.save();

        req.flash('success', 'Email confirmed successfully');

        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to destroy session' });
            }
            res.redirect('/user/login');
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Hiển thị đăng nhập   ==> DONE
const getLoginUser = async (req, res) => {
    try {
        if (req.session.user) {
            res.redirect('/user/home');
        } else {
            res.render('user/user_Login');
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Gửi thông tin đăng nhập  ==> DONE
const postLoginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ user_email: email });

        if (!user) {
            req.flash('error', 'Incorrectly entered user name or password');
            return res.redirect('/user/login');
        }

        const isMatch = await bcrypt.compare(password, user.user_password);

        if (!isMatch) {
            req.flash('error', 'Incorrectly entered user name or password');
            return res.redirect('/user/login');
        }

        req.session.user = user;
        return res.redirect('/user/home');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Hiển thị để chặn khi người dùng bị khóa  ==> DONE
const getLockedStatusUser = async (req, res) => {
    try {
        res.render('user/user_LockedStatusUser');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Hiển thị trang tin tuc  ==> DONE
const getNewsPage = async (req, res) => {
    const user = await User.findById(req.session.user._id);

    try {
        res.render('user/user_News', { user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Hiển thị để chặn khi người dùng chưa xác nhận email
const getResendEmailUser = async (req, res) => {
    try {
        res.render('user/user_ResendEmailUser');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Hiển thị để người dùng gửi lại email xác nhận
const postResendEmailUser = async (req, res) => {
    try {
        const token = crypto.randomBytes(20).toString('hex');
        const tokenExpiration = Date.now() + 60000;

        const user = await User.findById(req.session.user._id);;

        if (user) {
            user.email_verification_token = token
            user.email_verification_token_expiration = tokenExpiration

            await user.save();

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.USER_EMAIL,
                    pass: process.env.PASS_EMAIL,
                },
            });

            const currentURL = req.protocol + '://' + req.get('host');

            const mailOptions = {
                from: 'Sign Language System',
                to: user.user_email,
                subject: 'Account Registration Verification',
                html: `
                    <p>Hello ${user.user_full_name},</p>
                    <p>Please click on the following link to verify your account registration:</p>
                    <a href="${currentURL}/user/verify-email-token/${token}">Verify Account</a>
                `,
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            req.flash('success', 'User account successfully sent. Verification email has been sent to user');
            return res.redirect('/user/resend-email');
        } else {
            return res.status(404).json({ message: 'Please try again' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Đăng xuất ==> DONE
const getLogoutUser = async (req, res) => {
    try {
        req.session.user = null;

        res.redirect('/user/login');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Đổi mật khẩu người dùng ==> DONE
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.' });
    }

    try {
        // Tìm người dùng trong cơ sở dữ liệu
        const user = await User.findById(req.session.user._id);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await bcrypt.compare(oldPassword, user.user_password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu hiện tại không chính xác.' });
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật mật khẩu mới
        user.user_password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Mật khẩu đã được thay đổi thành công.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại sau.' });
    }

}

// Lấy thông tin HOME  ==> DONE
const getHomePage = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        const topics = await Topic.find()
        const vocabularys = await Vocabulary.find()

        if (!user) {
            req.flash('error', 'Please try again');
            return res.redirect('/user/profile')
        }

        res.render('user/user_Home', { user, topics, vocabularys });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Thông tin cá nhân ==> DONE
const getProfileUser = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);

        if (!user) {
            req.flash('error', 'Please try again');
            return res.redirect('/user/home')
        }

        res.render('user/user_userProfile', { user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Lấy thông tin tất cả từ vựng  ==> DONE
const getListVocabulary = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        const userId = user._id;

        // Tìm tất cả các từ vựng
        const vocabularies = await Vocabulary.find().exec();

        // Tìm tất cả các từ vựng yêu thích của người dùng
        const favorites = await VocabularyUser.find({ user: userId }).exec();

        // Chuyển đổi favorite documents thành một tập hợp các vocabulary IDs
        const favoriteVocabularyIds = new Set(favorites.map(fav => fav.vocabulary.toString()));

        // Gửi dữ liệu và thông tin yêu thích đến client
        res.render('user/user_ListVocabulary', {
            list_vocabulary: vocabularies.map(vocabulary => ({
                ...vocabulary._doc,
                is_Favorite: favoriteVocabularyIds.has(vocabulary._id.toString())
            }))
            , user, list_vocabulary_length: vocabularies.length
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Lấy thông tin tất cả từ vựng  theo BẢNG CHỮ CÁI ==> DONE
const getListVocabularyAlphabet = async (req, res) => {
    try {
        // const list_vocabulary = await Vocabulary.find({ vocabulary_recommendation_status: 1 });
        const user = await User.findById(req.session.user._id);
        const list_vocabulary = await Vocabulary.find({ vocabulary_topic: 'Bảng chữ cái' });
        // Sort the vocabulary list by name
        list_vocabulary.sort((a, b) => a.vocabulary_name.localeCompare(b.vocabulary_name));
        const list_vocabulary_length = list_vocabulary.length
        res.render('user/user_ListVocabularyAlphabet', { list_vocabulary, user, list_vocabulary_length });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Hiển thị danh sách từ vựng sorted theo "Độ Khó" và "BẢNG CHỨ CÁI" hoặc theo yêu cầu khác ==> DONE
const getListVocabularySorted = async (req, res) => {
    try {
        const { sorted } = req.query;

        console.log({ sorted });

        let list_vocabulary;

        if (sorted === 'difficulty') {
            // Sắp xếp theo độ khó
            list_vocabulary = await Vocabulary.find().sort({ vocabulary_difficulty_level: 1 });
        } else if (sorted === 'alphabetical') {
            // Sắp xếp theo bảng chữ cái
            list_vocabulary = await Vocabulary.find({ vocabulary_topic: "Bảng chữ cái" })
            list_vocabulary.sort((a, b) => a.vocabulary_name.localeCompare(b.vocabulary_name));
        } else {
            // Nếu không có tham số sorted, lấy tất cả mà không sắp xếp
            list_vocabulary = await Vocabulary.find();
        }

        // Trả về dữ liệu JSON
        res.json(list_vocabulary);
    } catch (error) {
        console.error('Error fetching sorted vocabulary data:', error);
        res.status(500).send('Server error');
    }
};


// Lấy thông tin CHI TIẾT TỪ VỰNG ==> DONE
const getDetailVocabulary = async (req, res) => {
    const vocabularyId = req.params.id;
    const user = await User.findById(req.session.user._id);

    try {
        const vocabulary = await Vocabulary.findById(vocabularyId);
        if (!vocabulary) {
            return res.redirect('/405');
        }

        // Tìm các từ vựng cùng chủ đề (trừ từ vựng hiện tại)
        const relatedVocabularies = await Vocabulary.find({
            _id: { $ne: vocabularyId }, // Loại bỏ từ vựng hiện tại
            vocabulary_topic: vocabulary.vocabulary_topic // Cùng chủ đề
        }).limit(4); // Giới hạn số lượng từ vựng liên quan (nếu muốn)


        console.log(relatedVocabularies)

        res.render('user/user_DetailVocabulary', { vocabulary, user, relatedVocabularies });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy thông tin tất cả topic ==> DONE
const getListTopic = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        const topics = await Topic.find()

        res.render('user/user_ListTopic', { user, topics });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Lấy thông tin tất cả độ khó  ==> DONE
const getListDifficultyLevel = async (req, res) => {
    try {
        // Fetch sorted vocabulary list from the database (ascending order by default)
        const sortedVocabulary = await Vocabulary.find().sort({ vocabulary_difficulty_level: 1 });

        console.log("DATA đã sort: ", sortedVocabulary)

        // Render the template with sorted data
        res.render('user/user_ListVocabulary', { sortedVocabulary });
    } catch (error) {
        console.error('Error fetching sorted vocabulary data:', error);
        res.status(500).send('Server error');
    }
};


// Lấy danh sách từ vựng theo chủ đề  ==> KHÔNG DÙNG
const getListVocabularyTopic = async (req, res) => {
    const topicId = req.params.id;

    try {
        const list_vocabulary_topic = await VocabularyTopic.find({ topic: topicId }).populate('vocabulary');
        if (!list_vocabulary_topic) {
            return res.redirect('/405');
        }

        res.render('user/user_ListVocabularyTopic', { list_vocabulary_topic });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy danh sách từ vựng theo chữ cái  ==> DONE
const getListVocabularyLetter = async (req, res) => {
    const letter = req.params.letter.toLowerCase();
    const user = await User.findById(req.session.user._id);

    const userId = req.session.user._id;

    try {
        // Tìm danh sách từ vựng liên quan đến từ khóa
        const list_vocabulary_letter = await Vocabulary.find({
            vocabulary_name: new RegExp('^' + letter, 'i') // 'i' để không phân biệt hoa thường
        });

        // Lấy danh sách từ vựng yêu thích của người dùng
        const favorites = await VocabularyUser.find({ user: userId }).exec();
        const favoriteVocabularyIds = favorites.map(fav => fav.vocabulary.toString());


        // Tạo danh sách từ vựng với thông tin về việc có được yêu thích hay không
        const listWithFavorites = list_vocabulary_letter.map(vocabulary => ({
            ...vocabulary._doc,
            is_Favorite: favoriteVocabularyIds.includes(vocabulary._id.toString())
        }));

        // Render danh sách từ vựng với thông tin yêu thích
        res.render('user/user_ListVocabularyLetter', {
            list_vocabulary_letter: listWithFavorites
            , user, list_vocabulary_length: list_vocabulary_letter.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Lấy danh sách từ vựng theo độ khó
const getListVocabularyDifficultyLevel = async (req, res) => {
    const level = req.params.level;

    try {
        const list_vocabulary_difficulty_level = await Vocabulary.find({ vocabulary_difficulty_level: level });
        if (!list_vocabulary_difficulty_level) {
            return res.redirect('/405');
        }

        res.render('user/user_ListVocabularyDifficultyLevel', { list_vocabulary_difficulty_level });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Thêm từ vựng vào danh sách yêu thích ==> DONE
const postAddVocabularyUser = async (req, res) => {
    try {
        const { vocabularyId } = req.body;
        const user = await User.findById(req.session.user._id);


        if (!user || !vocabularyId) {
            return res.status(400).json({ message: 'User or Vocabulary not found' });
        }


        let vocabularyUser = await VocabularyUser.findOne({
            vocabulary: vocabularyId,
            user: user._id
        });

        if (vocabularyUser) {
            await vocabularyUser.deleteOne();
            return res.status(200).json({ success: true, message: 'Removed from favorites' });
        } else {
            vocabularyUser = new VocabularyUser({
                vocabulary: vocabularyId,
                user: user._id
            });

            await vocabularyUser.save();
            return res.status(200).json({ success: true, message: 'Added to favorites' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// Lấy thông tin tất cả từ vựng yêu thích  ==> DONE
const getListFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        const userId = user._id;

        // Tìm tất cả các từ vựng yêu thích của người dùng
        const favorites = await VocabularyUser.find({ user: userId }).exec();

        // Chuyển đổi favorite documents thành một tập hợp các vocabulary IDs
        const favoriteVocabularyIds = favorites.map(fav => fav.vocabulary.toString());

        // Tìm thông tin chi tiết các từ vựng yêu thích từ cơ sở dữ liệu
        const vocabularies = await Vocabulary.find({ _id: { $in: favoriteVocabularyIds } }).exec();

        // Gửi dữ liệu và thông tin yêu thích đến client
        res.render('user/user_ListVocabulary', {
            list_vocabulary: vocabularies.map(vocabulary => ({
                ...vocabulary._doc,
                is_Favorite: true // Tất cả từ vựng trong danh sách này đều là yêu thích
            })),
            user,
            list_vocabulary_length: vocabularies.length
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Lấy thông tin tất cả từ vựng yêu thích random để ôn tập ==> DONE
const getListPractice = async (req, res) => {
    try {
        const list_vocabulary_practice = await Vocabulary.find();
        const user = await User.findById(req.session.user._id);


        // Random danh sách
        const shuffled_list_practice = _.shuffle(list_vocabulary_practice).slice(0, 5);

        res.render('user/user_ListPractice', { shuffled_list_practice, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy thông tin tất cả từ vựng để ôn tập theo AI
const getListPracticeAI = async (req, res) => {
    try {
        const list_practice = await VocabularyUser.find().populate('vocabulary');
        const user = await User.findById(req.session.user._id);


        // Random danh sách
        const shuffled_list_practice = _.shuffle(list_practice);

        res.render('user/user_ListPracticeAI', { shuffled_list_practice, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};




// Xử lý và hiển thị kết quả ôn tập từ vựng yêu thích
const postListPractice = async (req, res) => {

    try {
        const { userAnswers } = req.body;

        console.log({ userAnswers })

        // Kiểm tra xem userAnswers có tồn tại và là mảng không
        if (!Array.isArray(userAnswers)) {
            console.error('Invalid input data: userAnswers is not an array');
            return res.status(400).json({ message: 'Invalid input data: userAnswers is not an array' });
        }

        let correct = 0;
        let incorrect = 0;

        // Duyệt qua từng câu trả lời để kiểm tra
        for (let i = 0; i < userAnswers.length; i++) {
            const userAnswer = userAnswers[i];
            const userResponse = userAnswer.answer ? userAnswer.answer.toLowerCase() : '';
            const correctResponse = userAnswer.correctAnswer ? userAnswer.correctAnswer.toLowerCase() : '';

            // So sánh câu trả lời của người dùng với đáp án đúng
            if (userResponse === correctResponse) {
                correct++;
            } else {
                incorrect++;
            }
        }

        // Trả về kết quả
        res.json({
            correct,
            incorrect,
            total: userAnswers.length
        });
    } catch (err) {
        console.error('Error processing results:', err);
        res.status(500).json({ message: 'Internal Server Error 11' });
    }
};

// Thêm từ vựng đề xuất
const postAddRecommendationVocabulary = async (req, res) => {
    try {
        const {
            vocabulary,
            vocabulary_difficulty_level,
            vocabulary_video_link,
        } = req.body;

        const vocabulary_recommendation_status = 2;

        const newVocabulary = new Vocabulary({
            vocabulary,
            vocabulary_difficulty_level,
            vocabulary_video_link,
            vocabulary_recommendation_status,
        });

        await newVocabulary.save();

        return res.redirect('/user/list-recommendation-vocabulary');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy thông tin tất cả từ vựng phê duyệt
const getListRecommendationVocabulary = async (req, res) => {
    try {
        const list_recommendation_vocabulary = await Vocabulary.find({ vocabulary_recommendation_status: 2 });
        res.render('user/user_ListRecommendationVocabulary', { list_recommendation_vocabulary });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get trang LIÊN HỆ 
const getContact = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);

        res.render('user/user_Contact', { user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Lấy thông tin chi tiết từ vựng
const getDetailVocabularyAI = async (req, res) => {
    try {
        res.render('user/user_DetailVocabularyAI');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Hiển thị trang upload mô hình
const getUploadModel = async (req, res) => {
    try {
        res.render('admin/admin_UploadModel');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Gửi mô hình lên thư mục
const postUploadModel = async (req, res) => {
    try {
        res.status(200).json({ message: 'Model uploaded successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getRegisterUser,
    postRegisterUser,
    getVerifyEmailTokenUser,
    getLoginUser,
    postLoginUser,
    getHomePage,
    changePassword,
    getLockedStatusUser,
    getResendEmailUser,
    postResendEmailUser,
    getLogoutUser,
    getNewsPage,
    getProfileUser,
    getListVocabulary,
    getListVocabularySorted,
    getListVocabularyAlphabet,
    getDetailVocabulary,
    getDetailVocabularyAI,
    getListTopic,
    getListDifficultyLevel,
    getListVocabularyTopic,
    getListVocabularyLetter,
    getListVocabularyDifficultyLevel,
    postAddVocabularyUser,
    getListFavorite,
    getListPractice,
    getListPracticeAI,
    postListPractice,
    postAddRecommendationVocabulary,
    getListRecommendationVocabulary,
    getContact,
    getUploadModel,
    postUploadModel,

};