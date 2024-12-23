import { S3Client, PutObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import uuid from 'uuid4';
import dotenv from 'dotenv';

dotenv.config(); // .env 파일 로드

// 환경 변수에서 AWS 키 가져오기
const AWS_ACCESS_KEY_ID = 'AKIAYRH5NFOA44I2AYUQ';
const AWS_SECRET_ACCESS_KEY = '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';
const REGION = 'ap-northeast-2';

// AWS S3 클라이언트 설정
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// AWS S3 업로드 설정 (multer-s3)
const storage = multerS3({
  s3: s3Client, // AWS S3 클라이언트 연결
  acl: 'public-read', // S3 Bucket의 객체에 대한 읽기 권한
  bucket: (req, file) => {
    // 메인 이미지와 세부 이미지 각각 다른 버킷에 업로드
    return file.fieldname === 'main_image' 
      ? 'alice.shopping.mall.main.image' 
      : 'alice.shopping.mall.detail.images';
  },
  contentType: multerS3.AUTO_CONTENT_TYPE, // 파일 MIME 타입 자동 지정
  key: (req, file, cb) => {
    // 파일 이름 생성 및 반환 (중복 방지를 위해 타임스탬프 + UUID 사용)
    cb(null, `${Date.now()}_${uuid()}_${file.originalname}`);
  },
});

// 파일 업로드 객체 생성
const uploadToS3 = multer({
  storage, // 파일 스토리지 설정
  limits: { fileSize: 5 * 1024 * 1024 }, // 파일 크기 제한 (5MB)
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
    cb(null, true);
  }
});

// S3에서 이미지 삭제 함수
const deleteImage = async (fileKey, bucketName) => {
  try {
    const deleteParams = {
      Bucket: bucketName,
      Key: fileKey,
    };
    await s3Client.send(new PutObjectCommand(deleteParams)); // 파일 삭제 요청
    console.log('이미지 삭제 성공');
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    throw new Error('이미지 삭제 실패');
  }
};

// S3 연결 확인 함수
const checkS3Connection = async () => {
  try {
    const command = new ListBucketsCommand({});
    const data = await s3Client.send(command);  // S3 버킷 목록 가져오기
    console.log('S3 연결 성공. 버킷 목록:', data.Buckets);
    return true;
  } catch (err) {
    console.error('S3 연결 실패:', err.message);
    return false;
  }
};

export { uploadToS3, deleteImage, checkS3Connection };
