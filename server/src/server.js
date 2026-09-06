require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// مسارات API
const authRoutes = require('./routes/authRoutes');
const violationRoutes = require('./routes/violationRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const reportRoutes = require('./routes/reportRoutes');
const locationRoutes = require('./routes/locationRoutes');
const auditRoutes = require('./routes/auditRoutes');

// معالجة الأخطاء
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// الميدلوير العامة
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// مجلد رفع صور الكاميرات وملفات النظام
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// مسار فحص الحالة
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    organization: 'أمانة عمّان الكبرى - المملكة الأردنية الهاشمية',
    system: 'نظام كشف وتعديل مخالفات الكاميرات الرقابية — قسم المخالفات'
  });
});

// تسجيل مسارات الـ API
app.use('/api/auth', authRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/audit-logs', auditRoutes);

// تقديم ملفات الواجهة المبنية في حال الإنتاج (Production)
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(clientBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('API Server is running (Amman Municipality). Client build not found yet.');
  }
});

// ميدلوير معالجة الأخطاء
app.use(errorHandler);

// الاستماع على 0.0.0.0 لإتاحة الوصول عبر الشبكة المحلية (LAN) في أمانة عمّان
app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🇯🇴 خادم أمانة عمّان الكبرى (قسم المخالفات) يعمل الآن`);
  console.log(`🔗 محلياً (Local):        http://localhost:${PORT}`);
  console.log(`🌐 على الشبكة الداخلية:  http://0.0.0.0:${PORT}`);
  console.log(`====================================================`);
});

module.exports = app;
