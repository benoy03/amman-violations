const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const violationController = require('../controllers/violationController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// إعداد التخزين للصور وملفات Excel
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// فحص رقم المخالفة
router.get('/check-number/:num', authenticateToken, violationController.checkViolationNumber);

// تصدير واستيراد Excel
router.get('/export-excel', authenticateToken, violationController.exportExcel);
router.get('/template-excel', authenticateToken, violationController.downloadTemplate);
router.post('/import-excel', authenticateToken, upload.single('file'), violationController.importExcel);

// رفع صورة المخالفة
router.post('/upload-image', authenticateToken, upload.single('image'), violationController.uploadImage);

// ترحيل وحفظ مخالفة جديدة
router.post('/', authenticateToken, violationController.createViolation);

// جلب سجل المخالفات العام
router.get('/', authenticateToken, violationController.getViolations);

// جلب سجلات دور معين مع الفلترة الفردية
router.get('/by-role/:role', authenticateToken, violationController.getViolationsByRole);

// جلب تفاصيل مخالفة واحدة
router.get('/:id', authenticateToken, violationController.getViolationById);

module.exports = router;
