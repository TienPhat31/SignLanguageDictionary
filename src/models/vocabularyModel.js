const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema({
    vocabulary_name: String,
    vocabulary_difficulty_level: String,
    vocabulary_video_link: String,
    // vocabulary_recommendation_status: Number,
    vocabulary_topic: String,
    is_Favorite: { type: Boolean, default: false }
}, { timestamps: true });

const Vocabulary = mongoose.model('Vocabulary', vocabularySchema);

module.exports = Vocabulary;
