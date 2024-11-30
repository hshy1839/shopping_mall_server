const express = require('express');
const { 
    checkIn, 
    checkOut, 
    getAttendance,
    getAllAttendance} = require('../controllers/statusController');

const router = express.Router();

// 출근 기록
router.post('/checkIn', checkIn);
//퇴근 기록
router.put('/checkOut', checkOut);
router.get('/attendanceInfo', getAttendance);
router.get('/allAttendanceInfo', getAllAttendance);


module.exports = router;
