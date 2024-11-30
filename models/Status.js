const mongoose = require("mongoose");

const statusSchema = mongoose.Schema({
    userId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date:
    {
        type: Date,
        required: true,
    },
    attendanceStatus:
    {
        type: String,
        required: true
    },
    checkInTime:
    {
        type: String,
    },
    checkOutTime:
    {
        type: String,
    },
});


const Status = mongoose.model("Status", statusSchema);

module.exports = { Status };
