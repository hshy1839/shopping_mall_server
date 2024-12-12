const express = require('express');
const { 
    createProduct, 
    getAllProducts, 
    deleteProduct, 
    getProduct, 
    updateProduct
} = require('../controllers/productController');

const router = express.Router();

// 디버깅 로그 추가: 요청 경로 확인
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// 상품 추가
router.post('/products/productCreate', createProduct);
// 상품 목록 조회
router.get('/products/allProduct', getAllProducts);
// 상품 특정 조회
router.get('/products/Product/:id', getProduct);
// 상품 삭제
router.delete('/products/delete/:id', deleteProduct);
// 상품 수정
router.put('/products/update/:id', updateProduct);

module.exports = router;
