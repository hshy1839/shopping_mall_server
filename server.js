const http = require('http');
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const connectDB = require('./db');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const JWT_SECRET = 'jm-attendance'; 


const userRoutes = require('./routes/userRoutes');
const statusRoutes = require('./routes/statusRoutes');
const noticeRoutes = require('./routes/noticeRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.listen(8863, () => {
  console.log('listening to http://192.168.25.24:8863');
});

connectDB();

app.use('/api/users', userRoutes);
app.use('/api/users', statusRoutes);
app.use('/api/users', noticeRoutes);

