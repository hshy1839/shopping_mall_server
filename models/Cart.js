const mongoose = require('mongoose');

// 장바구니 스키마 정의
const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 사용자 ID (User 모델 참조)
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // 상품 ID (Product 모델 참조)
      name: { type: String, required: true },   // 상품 이름
      price: { type: Number, required: true },  // 상품 가격
      quantity: { type: Number, required: true }, // 담긴 수량
      total: { type: Number, required: true }   // 해당 상품의 총 가격 (price * quantity)
    }
  ],
  totalAmount: { type: Number, required: true },  // 장바구니 총액 (모든 상품의 가격 합계)
  createdAt: { type: Date, default: Date.now },   // 장바구니 생성 날짜
  updatedAt: { type: Date, default: Date.now }    // 장바구니 업데이트 날짜
});

// 장바구니 모델 생성
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
