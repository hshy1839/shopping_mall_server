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

// 공지사항 추가
router.post('/products/productCreate', createProduct);
// 공지사항 목록 조회
router.get('/products', getAllProducts);
// 공지사항 특정 조회
router.get('/products/:id', getProduct);
// 공지사항 삭제
router.delete('/products/delete/:id', deleteProduct);
// 공지사항 수정
router.put('/products/update/:id', updateProduct);

module.exports = router;
