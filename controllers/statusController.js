const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { Status } = require('../models/Status');

//출근 처리
async function checkIn(req, res) {
    const { date, attendanceStatus, checkInTime } = req.body;
  
    // Authorization 헤더에서 JWT 추출
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }
  
    try {
      const decodedToken = jwt.verify(token, 'jm-attendance');
      const userId = decodedToken.userId;  // JWT에서 userId 추출
  
      // 같은 날짜로 출석 상태를 찾기
      const existingStatus = await Status.findOne({ userId, 
        date: {
          $gte: new Date(date).setHours(0, 0, 0, 0),  // 날짜의 시작으로 설정
          $lt: new Date(date).setHours(23, 59, 59, 999),  // 날짜의 끝으로 설정
        },
       });
  
      if (existingStatus) {
        // 이미 출석한 상태인 경우
        return res.status(400).json({ message: '이미 출석 하셨습니다!' });
      }
  
      // 출석 상태 생성
      const newStatus = new Status({
        userId,
        date,
        attendanceStatus,
        checkInTime,
      });
  
      await newStatus.save();
      
      res.status(200).json({ message: '출석 상태가 생성되었습니다.' });
    } catch (err) {
      // 서버 오류가 발생한 경우
      console.error(err);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
  
// 퇴근 처리
async function checkOut(req, res) {
    const { date, attendanceStatus, checkOutTime } = req.body;
  
    // Authorization 헤더에서 JWT 추출
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }
  
    try {
      const decodedToken = jwt.verify(token, 'jm-attendance');
      const userId = decodedToken.userId;  // JWT에서 userId 추출
  
      // 출석 상태를 업데이트할 문서를 찾기
      const existingStatus = await Status.findOne({ userId, date });
  
      if (!existingStatus) {
        return res.status(404).json({ message: '해당 날짜의 출석 상태가 존재하지 않습니다. 출근 후 퇴근을 해야 합니다.' });
      }
  
      // 이미 퇴근 완료 상태인 경우
      if (existingStatus.attendanceStatus === '퇴근 완료') {
        console.log('이미 퇴근');
        return res.status(400).json({ message: '이미 퇴근 하셨습니다!' });
      }
  
      // 출석 상태를 업데이트
      existingStatus.attendanceStatus = attendanceStatus;
      existingStatus.checkOutTime = checkOutTime;  // 퇴근 시간 업데이트
  
      // 업데이트된 상태 저장
      await existingStatus.save();
  
      res.status(200).json({ message: '퇴근 상태가 업데이트되었습니다.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
  
  // 출석 정보 가져오기
async function getAttendance(req, res) {
    const token = req.headers.authorization?.split(' ')[1];

  
    if (!token) {
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }
  
    try {
      const decodedToken = jwt.verify(token, 'jm-attendance');
      const userId = decodedToken.userId; // JWT에서 userId 추출
  
      // 사용자의 출석 정보를 가져옴
      const attendanceInfo = await Status.find({ userId });
  
      if (!attendanceInfo || attendanceInfo.length === 0) {
        return res.status(404).json({ message: '출석 정보가 없습니다.' });
      }
  
      // 출석 정보 반환 (date, checkInTime, checkOutTime, attendanceStatus 포함)
      const formattedAttendance = attendanceInfo.map(item => ({
        date: item.date,
        checkInTime: item.checkInTime,
        checkOutTime: item.checkOutTime,
        attendanceStatus: item.attendanceStatus,
      }));
  
      res.status(200).json(formattedAttendance);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }

  //모든 출결 정보 조회
  async function getAllAttendance(req, res) {
    const token = req.headers.authorization?.split(' ')[1];

  
    if (!token) {
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }
  
    try {
      const decodedToken = jwt.verify(token, 'jm-attendance');
  
      // 사용자의 출석 정보를 가져옴
      const attendanceInfo = await Status.find();
  
      if (!attendanceInfo || attendanceInfo.length === 0) {
        return res.status(404).json({ message: '출석 정보가 없습니다.' });
      }
  
      // 출석 정보 반환 (date, checkInTime, checkOutTime, attendanceStatus 포함)
      const formattedAttendance = attendanceInfo.map(item => ({
        date: item.date,
        checkInTime: item.checkInTime,
        checkOutTime: item.checkOutTime,
        attendanceStatus: item.attendanceStatus,
        userId: item.userId
      }));
  
      res.status(200).json(formattedAttendance);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
  

    
module.exports = {checkIn, checkOut, getAttendance, getAllAttendance};