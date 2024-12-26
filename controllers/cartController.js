const jwt = require('jsonwebtoken');
const  Cart  = require('../models/Cart'); // Cart 모델
const JWT_SECRET = 'jm_shoppingmall';
const mongoose = require("mongoose");

exports.addToCart = async (req, res) => {
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

    // decoded에서 userId 확인
    const userId = decoded?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Token does not contain userId' });
    }

    // 클라이언트에서 받은 productId와 userId를 ObjectId로 변환
    const { productId, sizes, price } = req.body; // 상품 ID, 사이즈, 가격
    const productIdObjectId = new mongoose.Types.ObjectId(productId);  // productId를 ObjectId로 변환
    const userIdObjectId = new mongoose.Types.ObjectId(userId); // userId를 ObjectId로 변환

    // 장바구니 데이터 검증
    if (!productId || !sizes || sizes.length === 0) {
      return res.status(400).json({ success: false, message: '상품 ID와 사이즈를 선택해야 합니다.' });
    }

    // 장바구니에 이미 상품이 있는지 확인
    const existingCart = await Cart.findOne({
      userId: userIdObjectId,  // ObjectId로 비교
      productId: productIdObjectId, // ObjectId로 비교
    });

    // 기존 장바구니에 같은 상품이 있는 경우
    if (existingCart) {
      // 사이즈 및 수량 업데이트
      updateCartSizes(existingCart, sizes, price);

      await existingCart.save(); // 장바구니 저장
      return res.status(200).json({ success: true, message: '장바구니에 상품이 추가되었습니다.' });
    } else {
      // 새 장바구니 항목 생성
      const newCartItem = new Cart({
        userId: userIdObjectId, // ObjectId로 저장
        productId: productIdObjectId, // ObjectId로 저장
        productName: req.body.productName, // productName 추가
        sizes,
        price,
        totalPrice: calculateTotalPrice(sizes, price),
      });

      await newCartItem.save(); // 장바구니 저장
      return res.status(200).json({
        success: true,
        message: '장바구니에 상품이 추가되었습니다.',
      });
    }
  } catch (err) {
    console.error('장바구니에 상품 추가 실패:', err);

    // 중복 키 에러 처리 (예: 상품이 이미 장바구니에 있는 경우)
    if (err.code === 11000) {
      const duplicatedField = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `이미 장바구니에 담긴 상품이 있습니다.`,
      });
    }

    // 기타 오류 처리
    return res.status(500).json({
      success: false,
      message: '장바구니 추가 중 오류가 발생했습니다.',
      error: err.message,
    });
  }
};



// 장바구니 사이즈 및 수량 업데이트
const updateCartSizes = (existingCart, sizes, price) => {
  sizes.forEach(sizeData => {
    const existingSize = existingCart.sizes.find(size => size.size === sizeData.size);
    if (existingSize) {
      existingSize.quantity += sizeData.quantity; // 기존 수량에 추가
    } else {
      existingCart.sizes.push(sizeData); // 새로운 사이즈 추가
    }
  });

  // 장바구니의 총 금액 재계산
  existingCart.totalPrice = calculateTotalPrice(existingCart.sizes, price);
};

// 장바구니 총 금액 계산
const calculateTotalPrice = (sizes, price) => {
  return sizes.reduce((total, sizeData) => {
    return total + (sizeData.quantity * price);
  }, 0);
};