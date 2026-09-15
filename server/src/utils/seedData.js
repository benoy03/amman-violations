/**
 * ==============================================================================
 * 🏛️ المملكة الأردنية الهاشمية — أمانة عمّان الكبرى
 * 🚔 مديرية الرقابة الآلية والتحكم — قسم كشف وتعديل مخالفات الكاميرات
 * 📋 ملف إدخال وتغذية البيانات الحقيقية المحمية (Safe Seed Data)
 * ==============================================================================
 */

const bcrypt = require('bcryptjs');
const db = require('../config/database');

const employeesList = [
  { number: '101', name: 'أحمد عادل' },
  { number: '102', name: 'محمد خليل العدوان' },
  { number: '103', name: 'طارق زياد المجالي' },
  { number: '104', name: 'عمر إبراهيم الحديد' },
  { number: '105', name: 'حمزة صالح المناصير' },
  { number: '26708', name: 'عبد الله النسور' },
  { number: '33718', name: 'مهند القضاة' },
  { number: '34063', name: 'محمد الرواشدة' },
  { number: '34617', name: 'ليث المعايطة' },
  { number: '37558', name: 'أنس الزعبي' },
  { number: '38783', name: 'يزن سامي الحنيطي' },
  { number: '44895', name: 'زيد العبادي' },
  { number: '47377', name: 'بلال حسن الزعبي' },
  { number: '47806', name: 'عبدالله ناصر العرموطي' },
  { number: '49659', name: 'خالد مروان الفايز' },
  { number: '49729', name: 'سليمان فهد الدعجة' },
  { number: '57154', name: 'معاذ عيسى القضاة' },
  { number: '66094', name: 'فيصل الخصاونة' },
  { number: '69833', name: 'فيصل راشد الطراونة' },
  { number: '72974', name: 'سيف الحنيطي' },
  { number: '106', name: 'أحمد محمود العبداللات' }
];

const cameraLocations = [
  { code: 'CAM-01', name: 'شارع الأردن - دوار الاستقلال', zone: 'شمال عمّان' },
  { code: 'CAM-02', name: 'شارع مكة - تقاطع الحرمين', zone: 'غرب عمّان' },
  { code: 'CAM-03', name: 'شارع زهران - إشارات الدوار الثامن', zone: 'غرب عمّان' },
  { code: 'CAM-04', name: 'شارع الشهيد - إشارة طبربور', zone: 'شمال عمّان' },
  { code: 'CAM-05', name: 'طريق المطار - جسر مادبا', zone: 'جنوب عمّان' },
  { code: 'CAM-06', name: 'شارع المدينة المنورة - تقاطع الكيلو', zone: 'غرب عمّان' },
  { code: 'CAM-07', name: 'شارع وصفي التل (الجاردنز) - إشارة الواحة', zone: 'شمال عمّان' },
  { code: 'CAM-08', name: 'شارع اليرموك - وادي الرمم', zone: 'شرق عمّان' },
  { code: 'CAM-09', name: 'أوتوستراد الزرقاء - ماركا', zone: 'شرق عمّان' }
];

function seedDatabase() {
  console.log('\n======================================================');
  console.log('🏛️ بدء تغذية وتحديث قاعدة بيانات أمانة عمّان الكبرى...');
  console.log('======================================================\n');

  // فقط في حال طلب إعادة التهيئة الكاملة صراحةً
  if (process.env.FORCE_RESET === 'true') {
    console.log('⚠️ تم تفعيل FORCE_RESET: جاري مسح السجلات وإعادة البناء...');
    db.exec(`
      DELETE FROM violations;
      DELETE FROM audit_logs;
    `);
  }

  // 1. إنشاء حسابات الدخول الرسمية للنظام
  const adminHash = bcrypt.hashSync('admin123', 10);
  const userHash = bcrypt.hashSync('user123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (username, password_hash, full_name, role)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(username) DO UPDATE SET
      password_hash = excluded.password_hash,
      full_name = excluded.full_name
  `);

  insertUser.run('admin', adminHash, 'مدير قسم المخالفات - أمانة عمّان', 'admin');
  insertUser.run('user', userHash, 'موظف الرقابة والتدقيق', 'user');
  console.log('✅ تم تجهيز حسابات الدخول الرسمية: admin / user');

  // 2. إدراج وتحديث الموظفين
  const roles = ['extractors', 'auditors', 'modifiers', 'reporters'];
  for (const role of roles) {
    const stmt = db.prepare(`
      INSERT INTO ${role} (number, name, is_active)
      VALUES (?, ?, 1)
      ON CONFLICT(number) DO UPDATE SET name = excluded.name, is_active = 1
    `);
    const insertMany = db.transaction((items) => {
      for (const item of items) {
        stmt.run(String(item.number).trim(), String(item.name).trim());
      }
    });
    insertMany(employeesList);
    console.log(`✅ تم تحديث/إدراج (${employeesList.length}) موظف في جدول [${role}].`);
  }

  // 3. إدراج مواقع الكاميرات
  const locStmt = db.prepare(`
    INSERT INTO camera_locations (code, name, zone, is_active)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(name) DO UPDATE SET code = excluded.code, zone = excluded.zone, is_active = 1
  `);
  const insertLocations = db.transaction((rows) => {
    for (const row of rows) {
      locStmt.run(row.code, row.name, row.zone);
    }
  });
  insertLocations(cameraLocations);
  console.log(`✅ تم تحديث/إدراج (${cameraLocations.length}) موقع كاميرا.`);

  const vCount = db.prepare('SELECT COUNT(*) as c FROM violations').get().c;
  console.log(`\n📊 إجمالي المخالفات في النظام: ${vCount} مخالفة (محمية ومحفوظة).`);

  console.log('\n======================================================');
  console.log('✨ اكتملت العملية بنجاح! قاعدة البيانات جاهزة 100%.');
  console.log('======================================================\n');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
