const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const violationController = require('../controllers/violationController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// إعداد التخزين للصور وملفات الفيديو وملفات Excel
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOADS_DIR || path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB للفيديو والصور
});

// فحص رقم المخالفة
router.get('/check-number/:num', authenticateToken, violationController.checkViolationNumber);

// تصدير واستيراد Excel
router.get('/export-excel', authenticateToken, violationController.exportExcel);
router.get('/template-excel', authenticateToken, violationController.downloadTemplate);
router.post('/import-excel', authenticateToken, upload.single('file'), violationController.importExcel);

// رفع صورة أو فيديو المخالفة
router.post('/upload-image', authenticateToken, upload.single('image'), violationController.uploadImage);
router.post('/upload-video', authenticateToken, upload.single('video'), violationController.uploadVideo);

// ترحيل وحفظ مخالفة جديدة
router.post('/', authenticateToken, violationController.createViolation);

// جلب سجل المخالفات العام
router.get('/', authenticateToken, violationController.getViolations);

// جلب سجلات دور معين مع الفلترة الفردية
router.get('/by-role/:role', authenticateToken, violationController.getViolationsByRole);

// جلب تفاصيل مخالفة واحدة
router.get('/:id', authenticateToken, violationController.getViolationById);

// تحديث مخالفة
router.put('/:id', authenticateToken, violationController.updateViolation);

// حذف مخالفة (للمدير فقط)
router.delete('/:id', authenticateToken, requireAdmin, violationController.deleteViolation);

module.exports = router;
