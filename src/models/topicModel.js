const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    topic_name: String,
    topic_image: String,
    topic_description: String,
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;
