const mongoose = require('mongoose');

// 상품 스키마 정의
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },        // 상품 이름
  category: { type: String, required: true },    // 카테고리 (예: 의류, 액세서리 등)
  main_image: { type: String },       // 이미지 URL (이미지 링크 또는 S3 링크 등)
  size: { type: [String], required: true },      // 사이즈 배열 (예: ['S', 'M', 'L'])
  createdAt: { type: Date, default: Date.now },  // 상품 생성 날짜
  price: { type: Number, required: true },       // 가격
  description: { type: String },      
  images: [{ type: String }],          
  stock: { type: Number, default: 0 },    
  gender: {type: String, required: true},       
});

// 상품 모델 생성
const Product = mongoose.model('Product', productSchema);

module.exports = {Product};
