/**
 * ==============================================================================
 * 🏛️ المملكة الأردنية الهاشمية — أمانة عمّان الكبرى
 * 🚔 مديرية الرقابة الآلية والتحكم — قسم كشف وتعديل مخالفات الكاميرات
 * 📋 ملف إدخال وتغذية البيانات الحقيقية (Professional Seed Data Template)
 * ==============================================================================
 * 
 * 💡 كيفية الاستخدام:
 * 1. قم بكتابة أو نسخ ولصق أسماء وأرقام كادر العمل ومواقع الكاميرات في القوائم أدناه.
 * 2. يمكنك نسخ الأعمدة من ملف Excel أو كتابتها يدوياً بالصيغة:
 *    { number: 'الرقم', name: 'الاسم الحقيقي بالكامل' }
 * 3. بعد الانتهاء، احفظ الملف وشغّل الأمر التالي في موجه الأوامر (Terminal):
 *    npm run seed
 * ==============================================================================
 */

const bcrypt = require('bcryptjs');
const db = require('../config/database');

// ==============================================================================
// 1️⃣ قائمة المستخرجين (Extractors)
// أدخل رقم واسم كل موظف مستخرج هنا
// ==============================================================================
const extractors = [
  // { number: '101', name: 'أحمد محمود العبداللات' },
  // { number: '102', name: 'محمد خليل العدوان' },
  // { number: '103', name: 'طارق زياد المجالي' },
];

// ==============================================================================
// 2️⃣ قائمة المدققين (Auditors)
// أدخل رقم واسم كل موظف مدقق هنا
// ==============================================================================
const auditors = [
  // { number: '201', name: 'عمر إبراهيم الحديد' },
  // { number: '202', name: 'حمزة صالح المناصير' },
  // { number: '203', name: 'خالد مروان الفايز' },
];

// ==============================================================================
// 3️⃣ قائمة المعدلين (Modifiers)
// أدخل رقم واسم كل موظف معدل هنا
// ==============================================================================
const modifiers = [
  // { number: '301', name: 'سليمان فهد الدعجة' },
  // { number: '302', name: 'يزن سامي الحنيطي' },
  // { number: '303', name: 'عبدالله ناصر العرموطي' },
];

// ==============================================================================
// 4️⃣ قائمة المبلّغين (Reporters)
// أدخل رقم واسم كل موظف مبلّغ هنا
// ==============================================================================
const reporters = [
  // { number: '401', name: 'بلال حسن الزعبي' },
  // { number: '402', name: 'معاذ عيسى القضاة' },
  // { number: '403', name: 'فيصل راشد الطراونة' },
];

// ==============================================================================
// 5️⃣ مواقع كاميرات أمانة عمّان الكبرى (Camera Locations)
// أدخل اسم الموقع/الشارع والمنطقة التابعة لها
// ==============================================================================
const cameraLocations = [
  // { name: 'شارع الأردن - دوار الاستقلال', zone: 'شمال عمّان' },
  // { name: 'شارع مكة - تقاطع الحرمين', zone: 'غرب عمّان' },
  // { name: 'شارع زهران - إشارات الدوار الثامن', zone: 'غرب عمّان' },
  // { name: 'شارع الشهيد - إشارة طبربور', zone: 'شمال عمّان' },
  // { name: 'طريق المطار - جسر مادبا', zone: 'جنوب عمّان' },
  // { name: 'شارع المدينة المنورة - تقاطع الكيلو', zone: 'غرب عمّان' },
  // { name: 'شارع وصفي التل (الجاردنز) - إشارة الواحة', zone: 'شمال عمّان' },
  // { name: 'شارع اليرموك - وادي الرمم', zone: 'شرق عمّان' },
];

// ==============================================================================
// ⚙️ معالج التغذية والحفظ في قاعدة البيانات (Execution Engine)
// ==============================================================================
function seedDatabase() {
  console.log('\n======================================================');
  console.log('🏛️ بدء تغذية وتحديث قاعدة بيانات أمانة عمّان الكبرى...');
  console.log('======================================================\n');

  // تنظيف السجلات القديمة وإعادة التهيئة
  db.exec(`
    DELETE FROM violations;
    DELETE FROM extractors;
    DELETE FROM auditors;
    DELETE FROM modifiers;
    DELETE FROM reporters;
    DELETE FROM camera_locations;
    DELETE FROM audit_logs;
    DELETE FROM users;
  `);

  // 1. إنشاء حسابات الدخول الرسمية للنظام
  const adminHash = bcrypt.hashSync('admin123', 10);
  const userHash = bcrypt.hashSync('user123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (username, password_hash, full_name, role)
    VALUES (?, ?, ?, ?)
  `);

  insertUser.run('admin', adminHash, 'مدير قسم المخالفات - أمانة عمّان', 'admin');
  insertUser.run('user', userHash, 'موظف الرقابة والتدقيق', 'user');
  console.log('✅ تم تجهيز حسابات الدخول الرسمية:');
  console.log('   👤 مدير النظام:  admin / admin123');
  console.log('   👤 موظف الرقابة: user  / user123');

  // 2. إدراج الموظفين (Transaction)
  const insertRole = (tableName, items, roleLabel) => {
    if (!items || items.length === 0) {
      console.log(`ℹ️ [${roleLabel}]: لا توجد عناصر مدخلة في القائمة حالياً.`);
      return;
    }
    const stmt = db.prepare(`INSERT INTO ${tableName} (number, name) VALUES (?, ?)`);
    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        if (row.number && row.name) {
          stmt.run(String(row.number).trim(), String(row.name).trim());
        }
      }
    });
    insertMany(items);
    console.log(`✅ تم إدراج (${items.length}) من [${roleLabel}] بنجاح.`);
  };

  insertRole('extractors', extractors, 'المستخرجين');
  insertRole('auditors', auditors, 'المدققين');
  insertRole('modifiers', modifiers, 'المعدلين');
  insertRole('reporters', reporters, 'المبلغين');

  // 3. إدراج مواقع الكاميرات
  if (cameraLocations && cameraLocations.length > 0) {
    const locStmt = db.prepare(`INSERT INTO camera_locations (name, zone) VALUES (?, ?)`);
    const insertLocations = db.transaction((rows) => {
      for (const row of rows) {
        if (row.name) {
          locStmt.run(String(row.name).trim(), row.zone ? String(row.zone).trim() : 'عمّان');
        }
      }
    });
    insertLocations(cameraLocations);
    console.log(`✅ تم إدراج (${cameraLocations.length}) من [مواقع الكاميرات] بنجاح.`);
  } else {
    console.log(`ℹ️ [مواقع الكاميرات]: لا توجد مواقع مدخلة في القائمة حالياً.`);
  }

  console.log('\n======================================================');
  console.log('✨ اكتملت العملية بنجاح! قاعدة البيانات جاهزة 100%.');
  console.log('======================================================\n');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
