const db = require('../config/database');

// تحويل اسم الدور للجدول والعمود المقابل
function getRoleMeta(role) {
  const map = {
    extractors: { table: 'extractors', column: 'extractor_id', label: 'المستخرجين' },
    extractor: { table: 'extractors', column: 'extractor_id', label: 'المستخرجين' },
    auditors: { table: 'auditors', column: 'auditor_id', label: 'المدققين' },
    auditor: { table: 'auditors', column: 'auditor_id', label: 'المدققين' },
    modifiers: { table: 'modifiers', column: 'modifier_id', label: 'المعدلين' },
    modifier: { table: 'modifiers', column: 'modifier_id', label: 'المعدلين' },
    reporters: { table: 'reporters', column: 'reporter_id', label: 'المبلغين' },
    reporter: { table: 'reporters', column: 'reporter_id', label: 'المبلغين' }
  };
  return map[role] || null;
}

/**
 * جلب قائمة الموظفين النشطين حسب الدور
 */
function getEmployees(req, res, next) {
  try {
    const { role } = req.params;
    const meta = getRoleMeta(role);
    if (!meta) {
      return res.status(400).json({ success: false, message: 'الدور المحدد غير صالح' });
    }

    const rows = db.prepare(`
      SELECT id, number, name, is_active, created_at
      FROM ${meta.table}
      WHERE is_active = 1
      ORDER BY CAST(number AS INTEGER) ASC, number ASC
    `).all();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * جلب جميع الموظفين مع إحصائية عدد المخالفات المسجلة لكل منهم (لشاشة إدارة الموظفين)
 */
function getAllEmployeesWithStats(req, res, next) {
  try {
    const { role } = req.params;
    const meta = getRoleMeta(role);
    if (!meta) {
      return res.status(400).json({ success: false, message: 'الدور المحدد غير صالح' });
    }

    const rows = db.prepare(`
      SELECT 
        e.id, 
        e.number, 
        e.name, 
        e.is_active, 
        e.created_at,
        COUNT(v.id) as violations_count
      FROM ${meta.table} e
      LEFT JOIN violations v ON v.${meta.column} = e.number
      GROUP BY e.id, e.number, e.name, e.is_active, e.created_at
      ORDER BY e.is_active DESC, CAST(e.number AS INTEGER) ASC
    `).all();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * إضافة موظف جديد
 */
function createEmployee(req, res, next) {
  try {
    const { role } = req.params;
    const { number, name } = req.body;
    const meta = getRoleMeta(role);

    if (!meta) {
      return res.status(400).json({ success: false, message: 'الدور المحدد غير صالح' });
    }

    if (!number || !name || !number.trim() || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال رقم واسم الموظف'
      });
    }

    const cleanNum = number.trim();
    const cleanName = name.trim();

    // التحقق من عدم وجود الرقم مسبقاً
    const existing = db.prepare(`SELECT * FROM ${meta.table} WHERE number = ?`).get(cleanNum);
    if (existing) {
      if (existing.is_active === 0) {
        // إذا كان محذوفاً (Soft deleted)، نقوم بإعادة تفعيله وتحديث اسمه
        db.prepare(`UPDATE ${meta.table} SET name = ?, is_active = 1 WHERE number = ?`).run(cleanName, cleanNum);
        return res.json({
          success: true,
          message: 'تمت إعادة تفعيل الموظف وتحديث بياناته بنجاح',
          data: { id: existing.id, number: cleanNum, name: cleanName, is_active: 1 }
        });
      }
      return res.status(400).json({
        success: false,
        message: `رقم الموظف (${cleanNum}) مسجل مسبقاً باسم: ${existing.name}`
      });
    }

    const info = db.prepare(`INSERT INTO ${meta.table} (number, name) VALUES (?, ?)`).run(cleanNum, cleanName);

    res.status(201).json({
      success: true,
      message: 'تمت إضافة الموظف بنجاح',
      data: {
        id: info.lastInsertRowid,
        number: cleanNum,
        name: cleanName,
        is_active: 1
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * فحص عدد المخالفات المرتبطة برقم موظف قبل الحذف
 */
function checkEmployeeViolations(req, res, next) {
  try {
    const { role, number } = req.params;
    const meta = getRoleMeta(role);
    if (!meta) {
      return res.status(400).json({ success: false, message: 'الدور المحدد غير صالح' });
    }

    const count = db.prepare(`
      SELECT COUNT(*) as count FROM violations WHERE ${meta.column} = ?
    `).get(number).count;

    res.json({
      success: true,
      violationsCount: count,
      hasViolations: count > 0
    });
  } catch (error) {
    next(error);
  }
}

/**
 * حذف موظف (Soft Delete)
 */
function deleteEmployee(req, res, next) {
  try {
    const { role, number } = req.params;
    const meta = getRoleMeta(role);
    if (!meta) {
      return res.status(400).json({ success: false, message: 'الدور المحدد غير صالح' });
    }

    const employee = db.prepare(`SELECT * FROM ${meta.table} WHERE number = ?`).get(number);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'الموظف غير موجود' });
    }

    // فحص المخالفات المرتبطة
    const violationsCount = db.prepare(`
      SELECT COUNT(*) as count FROM violations WHERE ${meta.column} = ?
    `).get(number).count;

    // تطبيق الحذف المنطقي Soft Delete لحماية السجلات التاريخية
    db.prepare(`UPDATE ${meta.table} SET is_active = 0 WHERE number = ?`).run(number);

    res.json({
      success: true,
      message: `تم إلغاء تفعيل الموظف (${employee.name}) بنجاح`,
      violationsLinked: violationsCount
    });
  } catch (error) {
    next(error);
  }
}

/**
 * إدراج أو تحديث مجموعة موظفين دفعة واحدة (Bulk Import / Paste)
 */
function bulkCreateEmployees(req, res, next) {
  try {
    const { role } = req.params;
    const { items } = req.body;
    const meta = getRoleMeta(role);

    if (!meta) {
      return res.status(400).json({ success: false, message: 'الدور المحدد غير صالح' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'لم يتم إرسال أي بيانات صالحة للإدراج' });
    }

    const checkStmt = db.prepare(`SELECT * FROM ${meta.table} WHERE number = ?`);
    const insertStmt = db.prepare(`INSERT INTO ${meta.table} (number, name, is_active) VALUES (?, ?, 1)`);
    const updateStmt = db.prepare(`UPDATE ${meta.table} SET name = ?, is_active = 1 WHERE number = ?`);

    let insertedCount = 0;
    let updatedCount = 0;

    const runBulk = db.transaction((list) => {
      for (const item of list) {
        const num = String(item.number || '').trim();
        const name = String(item.name || '').trim();
        if (!num || !name) continue;

        const existing = checkStmt.get(num);
        if (existing) {
          updateStmt.run(name, num);
          updatedCount++;
        } else {
          insertStmt.run(num, name);
          insertedCount++;
        }
      }
    });

    runBulk(items);

    const { logAction } = require('../utils/auditLogger');
    logAction({
      req,
      action: 'إدراج موظفين جماعي',
      entity: meta.table,
      details: `إدراج (${insertedCount}) وتحديث (${updatedCount}) موظف في قائمة ${meta.label}`
    });

    res.json({
      success: true,
      message: `تمت المعالجة بنجاح: تم إدراج (${insertedCount}) جديد وتحديث (${updatedCount}) موظف`,
      inserted: insertedCount,
      updated: updatedCount,
      total: insertedCount + updatedCount
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getEmployees,
  getAllEmployeesWithStats,
  createEmployee,
  checkEmployeeViolations,
  deleteEmployee,
  bulkCreateEmployees
};
