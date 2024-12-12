const jwt = require('jsonwebtoken');
const { Product } = require('../models/Product');  // Product 모델로 변경
const JWT_SECRET = 'jm_shoppingmall';
const mongoose = require("mongoose");

// 제품 추가
exports.createProduct = async (req, res) => {
    console.log(req.body);
    try {
      // 요청 헤더에서 Authorization 토큰 추출
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) {
        return res.status(403).json({ success: false, message: 'Token is required' });
      }
  
      // JWT 토큰 검증
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }
  
      // 토큰 검증 후 userId가 없는 경우 처리
      if (!decoded || !decoded.userId) {
        return res.status(401).json({ success: false, message: 'Token does not contain userId' });
      }
  
      // 클라이언트에서 보낸 데이터 추출
      const { name, category, price, description, stock, gender, size } = req.body;
      const images = req.files ? req.files.map(file => file.path) : [];  // 이미지 파일 배열
      const mainImage = req.file ? req.file.path : '';  // 대표 이미지
  
      // 새로운 제품 객체 생성
      const product = new Product({
        name,
        category,
        price,
        description,
        stock,
        gender,
        size,
        mainImage,
        images,  // 추가 이미지들
      });
  
      // 제품 DB에 저장
      const createProduct = await product.save();
  
      // 제품 저장 성공 시 응답
      return res.status(200).json({
        success: true,
        product: createProduct,
      });
    } catch (err) {
      console.error('상품 등록 실패:', err);
  
      // 중복 키 에러 처리 (예: 이름이 중복되는 경우)
      if (err.code === 11000) {
        const duplicatedField = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `이미 사용 중인 ${duplicatedField}입니다.`,
        });
      }
  
      // 기타 오류 처리
      return res.status(500).json({
        success: false,
        message: '상품 등록 중 오류가 발생했습니다.',
        error: err.message,
      });
    }
  };

// 모든 제품 조회
exports.getAllProducts = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer 토큰에서 추출
        if (!token) {
            return res.status(401).json({ success: false, message: '토큰이 없습니다.' });
        }

        // 토큰 검증
        const decoded = jwt.verify(token, JWT_SECRET); // 토큰만 검증, 특정 유저 정보는 확인하지 않음
      

        // 제품 조회
        const products = await Product.find();
        if (!products || products.length === 0) {
            return res.status(404).json({ success: false, message: '제품을 찾을 수 없습니다.' });
        }

        res.status(200).json({
            success: true,
            totalProducts: products.length,
            products: products,
        });
    } catch (err) {
        console.error('모든 제품 조회 실패:', err);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
};

// 특정 제품 조회
exports.getProduct = async (req, res) => {
    const { id } = req.params;

    // 디버깅 로그 추가
    console.log('요청 ID:', id);

    // ID 유효성 확인
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error('유효하지 않은 제품 ID:', id);
        return res.status(400).json({ success: false, message: '유효하지 않은 제품 ID입니다.' });
    }

    try {
        // 토큰 검증
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            console.error('토큰 누락: 인증 실패');
            return res.status(401).json({ success: false, message: '로그인 정보가 없습니다.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('디코딩된 토큰:', decoded);

        // 제품 조회
        const product = await Product.findById(id);
        if (!product) {
            console.error('제품 없음:', id);
            return res.status(404).json({ success: false, message: '제품을 찾을 수 없습니다.' });
        }

        return res.status(200).json({ success: true, product });
    } catch (err) {
        console.error('제품 조회 중 오류:', err);
        return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
};

// 제품 삭제
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;  // URL 파라미터에서 ID 받기
  
    // Authorization 헤더에서 토큰 추출
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: '로그인 정보가 없습니다.' });
    }
  
    try {
        // 토큰 검증
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;
  
        // 유저 정보 찾기
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: '제품을 찾을 수 없습니다.' });
        }
  
        // 해당 제품 삭제
        await Product.findByIdAndDelete(id);
  
        return res.status(200).json({ success: true, message: '제품이 삭제되었습니다.' });
    } catch (err) {
        console.error('제품 삭제 중 오류 발생:', err);
        return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
};

// 제품 수정
exports.updateProduct = async (req, res) => {
    const { id } = req.params;  // URL 파라미터로 받은 제품 ID
    const { name, description, price, category } = req.body;  // 수정할 이름, 설명, 가격, 카테고리

    // Authorization 헤더에서 토큰 추출
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: '로그인 정보가 없습니다.' });
    }

    try {
        // 환경 변수에서 JWT_SECRET 가져오기
        const decoded = jwt.verify(token, JWT_SECRET);  // process.env.JWT_SECRET 사용
        const userId = decoded.userId;

        // 유저가 제품 수정 권한을 가지고 있는지 확인
        // (예시: 제품 작성자만 수정 가능하도록 조건을 추가할 수 있음)
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: '제품을 찾을 수 없습니다.' });
        }

        // 수정된 이름, 설명, 가격, 카테고리 업데이트
        product.name = name;
        product.description = description;
        product.price = price;
        product.category = category;

        // 제품 저장
        await product.save();

        return res.status(200).json({ success: true, message: '제품이 수정되었습니다.' });
    } catch (err) {
        console.error('제품 수정 중 오류 발생:', err);
        return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
};
