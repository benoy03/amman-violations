const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'src/config/database.sqlite'));

// جلب كل الجداول
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('=== الجداول الموجودة في قاعدة البيانات ===');
tables.forEach(t => {
  try {
    const count = db.prepare(`SELECT COUNT(*) as c FROM "${t.name}"`).get();
    console.log(`  - ${t.name}: ${count.c} سجل`);
  } catch (e) {
    console.log(`  - ${t.name}: خطأ - ${e.message}`);
  }
});

// آخر 5 مخالفات
try {
  const last5 = db.prepare(`
    SELECT id, violation_number, violation_date, wrong_vehicle_number, correct_vehicle_number, camera_location, entry_date
    FROM violations ORDER BY id DESC LIMIT 5
  `).all();
  
  console.log('\n=== آخر 5 مخالفات مسجلة ===');
  if (last5.length === 0) {
    console.log('  لا توجد مخالفات مسجلة بعد');
  } else {
    last5.forEach(v => {
      console.log(`  [${v.id}] ${v.violation_number} | ${v.violation_date} | ${v.wrong_vehicle_number} -> ${v.correct_vehicle_number} | ${v.camera_location} | أُدخل: ${v.entry_date}`);
    });
  }
} catch(e) {
  console.log('خطأ في جلب المخالفات:', e.message);
}

// إجمالي الموظفين
const empTables = ['extractors', 'auditors', 'modifiers', 'reporters'];
console.log('\n=== كادر الموظفين النشطين ===');
empTables.forEach(t => {
  try {
    const active = db.prepare(`SELECT COUNT(*) as c FROM ${t} WHERE is_active=1`).get();
    const total = db.prepare(`SELECT COUNT(*) as c FROM ${t}`).get();
    console.log(`  ${t}: ${active.c} نشط من أصل ${total.c}`);
  } catch(e) {
    console.log(`  ${t}: غير موجود`);
  }
});

db.close();
console.log('\n✅ انتهى الفحص');
