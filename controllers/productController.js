const jwt = require('jsonwebtoken');
const { Product } = require('../models/Product'); // Product 모델로 변경
const JWT_SECRET = 'jm_shoppingmall';
const mongoose = require("mongoose");

// 제품 추가
exports.createProduct = async (req, res) => {
    console.log(req.body);
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(403).json({ success: false, message: 'Token is required' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            console.error('Token verification failed:', err);
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ success: false, message: 'Token does not contain userId' });
        }

        const { name, categoryMain, categorySub, price, description, sizeStock } = req.body;
        const images = req.files ? req.files.map(file => file.path) : [];
        const mainImage = req.file ? req.file.path : '';

        const product = new Product({
            name,
            category: { main: categoryMain, sub: categorySub },
            price,
            description,
            sizeStock,
            mainImage,
            images,
        });

        const createProduct = await product.save();

        return res.status(200).json({
            success: true,
            product: createProduct,
        });
    } catch (err) {
        console.error('상품 등록 실패:', err);

        if (err.code === 11000) {
            const duplicatedField = Object.keys(err.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `이미 사용 중인 ${duplicatedField}입니다.`,
            });
        }

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
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: '토큰이 없습니다.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

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

    console.log('요청 ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error('유효하지 않은 제품 ID:', id);
        return res.status(400).json({ success: false, message: '유효하지 않은 제품 ID입니다.' });
    }

    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            console.error('토큰 누락: 인증 실패');
            return res.status(401).json({ success: false, message: '로그인 정보가 없습니다.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('디코딩된 토큰:', decoded);

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
    const { id } = req.params;

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: '로그인 정보가 없습니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: '제품을 찾을 수 없습니다.' });
        }

        await Product.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: '제품이 삭제되었습니다.' });
    } catch (err) {
        console.error('제품 삭제 중 오류 발생:', err);
        return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
};

// 제품 수정
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, sizeStock } = req.body;

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: '로그인 정보가 없습니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: '제품을 찾을 수 없습니다.' });
        }

        product.name = name;
        product.description = description;
        product.price = price;

        // categoryMain과 categorySub를 분리하여 저장
        if (category && category.main && category.sub) {
            product.category.main = category.main;  // 상위 카테고리
            product.category.sub = category.sub;    // 하위 카테고리
        } else if (category && category.main) {
            product.category.main = category.main;  // 상위 카테고리만 있는 경우
            product.category.sub = '';             // 하위 카테고리 비워두기
        } else {
            return res.status(400).json({ success: false, message: '카테고리 정보가 부족합니다.' });
        }

        if (sizeStock) {
            product.sizeStock.S = sizeStock.S || 0;
            product.sizeStock.M = sizeStock.M || 0;
            product.sizeStock.L = sizeStock.L || 0;
            product.sizeStock.XL = sizeStock.XL || 0;
        }

        await product.save();

        return res.status(200).json({ success: true, message: '제품이 수정되었습니다.' });
    } catch (err) {
        console.error('제품 수정 중 오류 발생:', err);
        return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
};

