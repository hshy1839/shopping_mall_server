const mongoose = require("mongoose");

const vacationSchema = mongoose.Schema({
    userId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    date:
    {
        type: String,
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


const Status = mongoose.model("Vacation", vacationSchema);

module.exports = { Vacation };
