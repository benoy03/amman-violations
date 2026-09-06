const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// إنشاء مجلد رفع صور الكاميرات إذا لم يكن موجوداً
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const db = new Database(dbPath);

// تمكين نمط WAL ومفاتيح الربط الأجنبية
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
    -- جدول المستخدمين
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- جداول الموظفين
    CREATE TABLE IF NOT EXISTS extractors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS auditors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS modifiers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reporters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- جدول مواقع كاميرات أمانة عمّان
    CREATE TABLE IF NOT EXISTS camera_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      zone TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- جدول المخالفات الرئيسي
    CREATE TABLE IF NOT EXISTS violations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      violation_number TEXT UNIQUE NOT NULL,
      violation_date TEXT NOT NULL,
      wrong_vehicle_number TEXT NOT NULL,
      correct_vehicle_number TEXT NOT NULL,
      error_type TEXT NOT NULL,
      extractor_id TEXT NOT NULL,
      extractor_name TEXT NOT NULL,
      auditor_id TEXT NOT NULL,
      auditor_name TEXT NOT NULL,
      modifier_id TEXT NOT NULL,
      modifier_name TEXT NOT NULL,
      reporter_id TEXT NOT NULL,
      reporter_name TEXT NOT NULL,
      camera_location TEXT DEFAULT 'شارع الأردن - دوار الاستقلال',
      image_url TEXT,
      entry_date TEXT NOT NULL,
      entry_day TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- جدول سجل العمليات والرقابة (Audit Trail)
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // التحقق من إضافة الأعمدة لجدول المخالفات إذا كان منشأ مسبقاً
  try {
    const tableInfo = db.prepare("PRAGMA table_info(violations)").all();
    const colNames = tableInfo.map(c => c.name);
    if (!colNames.includes('camera_location')) {
      db.exec("ALTER TABLE violations ADD COLUMN camera_location TEXT DEFAULT 'شارع الأردن - دوار الاستقلال'");
    }
    if (!colNames.includes('image_url')) {
      db.exec("ALTER TABLE violations ADD COLUMN image_url TEXT");
    }
  } catch (err) {
    console.error('ملاحظة أثناء التحقق من أعمدة الجدول:', err.message);
  }

  // إنشاء الفهارس بعد التأكد من وجود كافة الأعمدة
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_violations_number ON violations(violation_number);
    CREATE INDEX IF NOT EXISTS idx_violations_date ON violations(violation_date);
    CREATE INDEX IF NOT EXISTS idx_violations_entry_date ON violations(entry_date);
    CREATE INDEX IF NOT EXISTS idx_violations_extractor ON violations(extractor_id);
    CREATE INDEX IF NOT EXISTS idx_violations_auditor ON violations(auditor_id);
    CREATE INDEX IF NOT EXISTS idx_violations_modifier ON violations(modifier_id);
    CREATE INDEX IF NOT EXISTS idx_violations_reporter ON violations(reporter_id);
    CREATE INDEX IF NOT EXISTS idx_violations_location ON violations(camera_location);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
  `);
}

initializeDatabase();

module.exports = db;
