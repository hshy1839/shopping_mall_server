const mongoose = require("mongoose");

const noticeSchema = mongoose.Schema({
    authorId:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title:
    {
        type: String,
        required: true
    },
    content:
    {
        type: String,
    },
    authorName:
    {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now, // 기본값으로 생성된 날짜를 사용
    },
});


const Notice = mongoose.model("Notice", noticeSchema);

module.exports = { Notice };
