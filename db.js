const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.connect('mongodb://nuggiy:f2SbBZYbYo4U5cLU@undefined/?replicaSet=atlas-cg17lz-shard-0&ssl=true&authSource=admin', {
      
      tlsInsecure: true, // SSL/TLS 문제 해결
      family: 4,         // IPv4 강제 사용
    });
    console.log('MongoDB Atlas 연결 성공!');
  } catch (err) {
    console.error('MongoDB Atlas 연결 실패:', err);
  }
};

module.exports = connectDB;

