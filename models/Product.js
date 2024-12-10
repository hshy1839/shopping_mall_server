const mongoose = require('mongoose');

// 상품 스키마 정의
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },        // 상품 이름
  category: { type: String, required: true },    // 카테고리 (예: 의류, 액세서리 등)
  image: { type: String, required: true },       // 이미지 URL (이미지 링크 또는 S3 링크 등)
  color: { type: String, required: true },       // 색깔
  size: { type: [String], required: true },      // 사이즈 배열 (예: ['S', 'M', 'L'])
  createdAt: { type: Date, default: Date.now },  // 상품 생성 날짜
  price: { type: Number, required: true },       // 가격
  description: { type: String },                 // 상품 설명 (옵션)
  stock: { type: Number, default: 0 },           // 재고 수량
});

// 상품 모델 생성
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
