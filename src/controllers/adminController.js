const crypto = require('crypto');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const uploadVideo = require("../middlewares/adminMiddleware")

const Admin = require('../models/adminModel');
const Topic = require('../models/topicModel');
const User = require('../models/userModel');
const Vocabulary = require('../models/vocabularyModel');
const VocabularyTopic = require('../models/vocabularyTopicModel');
const VocabularyUser = require('../models/vocabularyUserModel');



// Hiển thị đăng nhập ==> DONE
const getLoginAdmin = async (req, res) => {
    try {
        if (req.session.admin) {
            res.redirect('/admin/admin_index.ejs');
        } else {
            res.render('admin/admin_Login.ejs');
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Gửi thông tin đăng nhập  ==> DONE
const postLoginAdmin = async (req, res) => {
    const { admin_name, admin_password } = req.body;

    try {
        const admin = await Admin.findOne({ admin_name, admin_password });

        if (!admin) {
            req.flash('error', 'Incorrectly name or password');
            return res.redirect('/admin/login')
        } else {
            req.session.admin = admin;
            return res.redirect('/admin/index')
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Đăng xuất ==> DONE
const getLogoutAdmin = async (req, res) => {
    try {
        req.session.admin = null;
        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Hiển thị trang INDEX ==> DONE
const getIndexAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.session.admin._id);

        const list_topic = await Topic.find();
        const list_user = await User.find();
        const list_vocabulary = await Vocabulary.find();


        const topicCount = await Topic.countDocuments();
        const userCount = await User.countDocuments();
        const vocabularyCount = await Vocabulary.countDocuments();

        if (!admin) {
            req.flash('error', 'Please try again');
            return res.redirect('/admin/admin-login')
        }

        res.render('admin/admin_Index.ejs', { admin, list_topic, list_user, list_vocabulary, topicCount, userCount, vocabularyCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy thông tin profile
const getProfileAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.session.admin._id);;

        if (!admin) {
            req.flash('error', 'Please try again');
            return res.redirect('/admin/admin-login')
        }

        res.render('admin/admin_Profile.ejs', { admin });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy thông tin tất cả từ vựng
const getListVocabulary = async (req, res) => {
    const admin = await Admin.findById(req.session.admin._id);

    try {
        const list_vocabulary = await Vocabulary.find();
        const list_topic = await Topic.find()
        res.render('admin/admin_ListVocabulary', { list_vocabulary, admin, list_topic });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Chi tiết từ vựng
const getVocabularyDetailByID = async (req, res) => {
    const vocabularyID = req.params.vocabularyID
    const admin = await Admin.findById(req.session.admin._id);

    try {
        const vocabulary = await Vocabulary.findById(vocabularyID)
        res.render('admin/admin_VocabularyDetail', { vocabulary, admin });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy data từ vựng để đưa vô EDIT MODAL
const postVocabularyByID = async (req, res) => {

    const vocabulary = await Vocabulary.findById(req.params.vocabularyID);

    try {
        res.json(vocabulary);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Thêm từ vựng ==> DONE
const postAddVocabulary = async (req, res) => {
    try {
        const newVocabulary = new Vocabulary({
            vocabulary_name: req.body.vocabulary_name,
            vocabulary_topic: req.body.vocabulary_topic,
            vocabulary_difficulty_level: req.body.vocabulary_difficulty_level,
            vocabulary_video_link: req.file ? req.file.path : null,
        });


        await newVocabulary.save();

        res.status(200).json({ message: 'Added vocabulary successfully', vocabulary: newVocabulary });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Chỉnh sửa từ vựng ==>
const putEditVocabulary = async (req, res) => {
    const vocabularyId = req.params.vocabularyID;

    const {
        vocabulary_name,
        vocabulary_topic,
        vocabulary_difficulty_level,
        vocabulary_video_link
    } = req.body;


    try {
        const updatedVocabulary = await Vocabulary.findByIdAndUpdate(vocabularyId, {
            vocabulary_name: vocabulary_name,
            vocabulary_topic: vocabulary_topic,
            vocabulary_difficulty_level,
            vocabulary_video_link,
        }, { new: true });

        if (!updatedVocabulary) {
            return res.status(404).json({ message: 'Please try again' });
        }

        res.status(200).json({ message: 'Edit vocabulary successfully', vocabulary: updatedVocabulary });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Xóa từ vựng trong database
const deleteDeleteVocabulary = async (req, res) => {
    const vocabularyId = req.params.vocabularyID;

    try {
        // const vocabularyTopicExist = await VocabularyTopic.findOne({ vocabulary: vocabularyId });
        // const vocabularyUserExist = await VocabularyUser.findOne({ vocabulary: vocabularyId });

        // if (vocabularyTopicExist) {
        //     return res.status(404).json({ message: 'Cannot be deleted because this vocabulary is included in the topic' });
        // }
        // if (vocabularyUserExist) {
        //     return res.status(404).json({ message: 'Cannot be deleted because this product is included in the user' });
        // }

        await Vocabulary.findByIdAndDelete(vocabularyId);

        res.status(200).json({ message: 'Delete vocabulary successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy thông tin tất cả từ vựng phê duyệt
const getListRecommendationVocabulary = async (req, res) => {
    try {
        const list_recommendation_vocabulary = await Vocabulary.find({ vocabulary_recommendation_status: 2 });
        res.render('admin/listRecommendationVocabulary', { list_recommendation_vocabulary });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Thay đổi thông tin từ vựng phê duyệt
const putChangeRecommendationVocabulary = async (req, res) => {
    const vocabularyId = req.params.id;
    const request = req.body; //gui 0 de choi, gui 1 hien thi

    try {
        const updatedVocabulary = await Vocabulary.findByIdAndUpdate(
            vocabularyId,
            {
                vocabulary_recommendation_status: request,
            },
            { new: true }
        );

        if (!updatedVocabulary) {
            return res.status(404).json({ message: 'Please try again' });
        }

        res.status(200).json({ message: 'Change status vocabulary successfully', vocabulary: updatedVocabulary });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Lấy thông tin tất cả chủ đề  ===> DONE
const getListTopic = async (req, res) => {
    const admin = await Admin.findById(req.session.admin._id);

    try {
        const list_topic = await Topic.find();
        res.render('admin/admin_ListTopic.ejs', { list_topic, admin });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Thêm chủ đề vào database  ==> DONE
const postAddTopic = async (req, res) => {
    try {
        const {
            topic_name,
            topic_description
        } = req.body;

        const topic_image = req.file.filename;

        console.log(topic_name)
        console.log(topic_description)
        console.log(topic_image)


        const newTopic = new Topic({
            topic_name,
            topic_description,
            topic_image
        });

        await newTopic.save();

        res.status(200).json({ message: 'Added topic successfully', topic: newTopic });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy data từ vựng để đưa vô EDIT MODAL
const getTopicByID = async (req, res) => {

    const topic = await Topic.findById(req.params.topicID);

    try {
        res.json(topic);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy data từ vựng để đưa vô EDIT MODAL
const getDetailTopicByID = async (req, res) => {

    const topic = await Topic.findById(req.params.topicID);
    const admin = await Admin.findById(req.session.admin._id);


    try {
        res.render('admin/admin_TopicDetails.ejs', { topic, admin })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Chỉnh sửa chủ đè vào database
const putEditTopic = async (req, res) => {
    const topicId = req.params.topicID;
    const {
        topic_name,
        topic_description,
    } = req.body;

    const topic_image = req.file.filename;

    try {
        const updatedTopic = await Topic.findByIdAndUpdate(topicId, {
            topic_name,
            topic_description,
            topic_image
        }, { new: true });

        if (!updatedTopic) {
            return res.status(404).json({ message: 'Please try again' });
        }

        res.status(200).json({ message: 'Edit topic successfully', topic: updatedTopic });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Xóa chủ đề vào database  ==> DONE
const deleteDeleteTopic = async (req, res) => {
    const topicId = req.params.topicID;

    try {
        // const vocabularyTopicExist = await VocabularyTopic.findOne({ topic: topicId });

        // if (vocabularyTopicExist) {
        //     return res.status(404).json({ message: 'Cannot be deleted because this topic is included the vocabulary' });
        // }

        await Topic.findByIdAndDelete(topicId);

        res.status(200).json({ message: 'Delete topic successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy thông tin tất cả người dùng
const getListUser = async (req, res) => {
    const admin = await Admin.findById(req.session.admin._id);

    try {
        const list_user = await User.find();
        res.render('admin/admin_ListUser', { list_user, admin });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy thông tin chi tiết người dùng
const getListDetailUser = async (req, res) => {
    const userId = req.params.id;
    const admin = await Admin.findById(req.session.admin._id);


    try {
        const user = await User.findById({ _id: userId })

        console.log(user)

        res.render('admin/admin_UserDetails', { user, admin });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Thay đổi trạng thái người dùng ==> DONE
const postChangeStatusUser = async (req, res) => {
    const userID = req.params.userID
    const { status } = req.body;
    try {
        const user = await User.findById(userID);

        if (!user) {
            return res.status(404).json({ message: 'Please try again' });
        }

        user.user_status = !status;
        await user.save();

        return res.status(200).json({ message: 'Updated status', user: user });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Phân tích báo cáo
const getAnalysisReport = async (req, res) => {
    try {
        const list_topic = await Topic.find();
        const list_user = await User.find();
        const list_vocabulary = await Vocabulary.find();


        const topicCount = await Topic.countDocuments();
        const userCount = await User.countDocuments();
        const vocabularyCount = await Vocabulary.countDocuments();



        res.render('admin/analysisReport', {
            total_topic,
            total_user,
            total_vocabulary,
            vocabularyCount,
            userCount,
            topicCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Hiển thị trang upload mô hình
const getUploadModel = async (req, res) => {

    const admin = await Admin.findById(req.session.admin._id);

    try {
        res.render('admin/admin_UploadModel', {admin});
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
    getLoginAdmin,
    postLoginAdmin,
    getLogoutAdmin,
    getIndexAdmin,
    getProfileAdmin,
    getVocabularyDetailByID,
    getListVocabulary,
    postAddVocabulary,
    postVocabularyByID,
    putEditVocabulary,
    deleteDeleteVocabulary,
    getListRecommendationVocabulary,
    putChangeRecommendationVocabulary,
    getListTopic,
    postAddTopic,
    getTopicByID,
    getDetailTopicByID,
    putEditTopic,
    deleteDeleteTopic,
    getListUser,
    getListDetailUser,
    postChangeStatusUser,
    getAnalysisReport,
    getUploadModel,
    postUploadModel,
};