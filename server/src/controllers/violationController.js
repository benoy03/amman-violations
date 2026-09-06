const db = require('../config/database');
const { getArabicDayName, getTodayString } = require('../utils/dateUtils');
const { logAction } = require('../utils/auditLogger');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

/**
 * التحقق اللحظي من توفر رقم المخالفة (Live Validation)
 */
function checkViolationNumber(req, res, next) {
  try {
    const { num } = req.params;
    if (!num || !num.trim()) {
      return res.json({ success: true, exists: false });
    }

    const row = db.prepare('SELECT id, violation_number FROM violations WHERE violation_number = ?').get(num.trim());

    res.json({
      success: true,
      exists: !!row,
      violationId: row ? row.id : null
    });
  } catch (error) {
    next(error);
  }
}

/**
 * ترحيل وتسجيل مخالفة جديدة (حفظ)
 */
function createViolation(req, res, next) {
  try {
    const {
      violation_number,
      violation_date,
      wrong_vehicle_number,
      correct_vehicle_number,
      error_type,
      custom_error_type,
      extractor_id,
      extractor_name,
      auditor_id,
      auditor_name,
      modifier_id,
      modifier_name,
      reporter_id,
      reporter_name,
      camera_location,
      image_url,
      entry_date,
      entry_day,
      notes
    } = req.body;

    const finalErrorType = (error_type === 'أخرى' && custom_error_type) 
      ? custom_error_type.trim() 
      : (error_type ? error_type.trim() : '');

    const errors = [];
    if (!violation_number || !violation_number.trim()) errors.push('رقم المخالفة مطلوب');
    if (!violation_date || !violation_date.trim()) errors.push('تاريخ المخالفة مطلوب');
    if (!wrong_vehicle_number || !wrong_vehicle_number.trim()) errors.push('رقم المركبة الخطأ مطلوب');
    if (!correct_vehicle_number || !correct_vehicle_number.trim()) errors.push('رقم المركبة الصحيح مطلوب');
    if (!finalErrorType) errors.push('طبيعة الخطأ مطلوبة');
    if (!extractor_id || !extractor_id.trim()) errors.push('رقم المستخرج مطلوب');
    if (!auditor_id || !auditor_id.trim()) errors.push('رقم المدقق مطلوب');
    if (!modifier_id || !modifier_id.trim()) errors.push('رقم المعدل مطلوب');
    if (!reporter_id || !reporter_id.trim()) errors.push('رقم المبلغ مطلوب');

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join('، '),
        errors
      });
    }

    const cleanNumber = violation_number.trim();

    const existing = db.prepare('SELECT id FROM violations WHERE violation_number = ?').get(cleanNumber);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `رقم المخالفة (${cleanNumber}) مسجل مسبقاً في النظام ولا يمكن تكراره!`
      });
    }

    const finalEntryDate = entry_date ? entry_date.trim() : getTodayString();
    const finalEntryDay = entry_day ? entry_day.trim() : getArabicDayName(finalEntryDate);
    const finalLocation = camera_location ? camera_location.trim() : 'شارع الأردن - دوار الاستقلال';

    const insertStmt = db.prepare(`
      INSERT INTO violations (
        violation_number, violation_date, wrong_vehicle_number, correct_vehicle_number,
        error_type, extractor_id, extractor_name, auditor_id, auditor_name,
        modifier_id, modifier_name, reporter_id, reporter_name,
        camera_location, image_url, entry_date, entry_day, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      cleanNumber,
      violation_date.trim(),
      wrong_vehicle_number.trim(),
      correct_vehicle_number.trim(),
      finalErrorType,
      extractor_id.trim(),
      extractor_name ? extractor_name.trim() : '',
      auditor_id.trim(),
      auditor_name ? auditor_name.trim() : '',
      modifier_id.trim(),
      modifier_name ? modifier_name.trim() : '',
      reporter_id.trim(),
      reporter_name ? reporter_name.trim() : '',
      finalLocation,
      image_url || null,
      finalEntryDate,
      finalEntryDay,
      notes ? notes.trim() : ''
    );

    const createdRecord = db.prepare('SELECT * FROM violations WHERE id = ?').get(result.lastInsertRowid);

    // توثيق العملية في سجل الرقابة
    logAction({
      req,
      action: 'ترحيل مخالفة جديدة',
      entity: 'violations',
      entityId: cleanNumber,
      details: `مخالفة رقم ${cleanNumber}، كاميرا ${finalLocation}، تعديل من ${wrong_vehicle_number} إلى ${correct_vehicle_number}`
    });

    res.status(201).json({
      success: true,
      message: 'تم ترحيل المعلومات وحفظ المخالفة بنجاح في أمانة عمّان',
      data: createdRecord
    });
  } catch (error) {
    next(error);
  }
}

/**
 * جلب سجل المخالفات العام مع البحث والفرز والترقيم
 */
function getViolations(req, res, next) {
  try {
    const {
      search,
      startDate,
      endDate,
      errorType,
      location,
      extractorId,
      auditorId,
      modifierId,
      reporterId,
      sortBy = 'id',
      sortOrder = 'DESC',
      page = 1,
      limit = 15,
      all = false
    } = req.query;

    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(`(
        violation_number LIKE ? OR
        wrong_vehicle_number LIKE ? OR
        correct_vehicle_number LIKE ? OR
        extractor_name LIKE ? OR
        auditor_name LIKE ? OR
        modifier_name LIKE ? OR
        reporter_name LIKE ? OR
        camera_location LIKE ? OR
        error_type LIKE ? OR
        notes LIKE ?
      )`);
      for (let i = 0; i < 10; i++) params.push(term);
    }

    if (startDate) {
      conditions.push('violation_date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('violation_date <= ?');
      params.push(endDate);
    }

    if (errorType) {
      conditions.push('error_type = ?');
      params.push(errorType);
    }

    if (location) {
      conditions.push('camera_location = ?');
      params.push(location);
    }

    if (extractorId) {
      conditions.push('extractor_id = ?');
      params.push(extractorId);
    }

    if (auditorId) {
      conditions.push('auditor_id = ?');
      params.push(auditorId);
    }

    if (modifierId) {
      conditions.push('modifier_id = ?');
      params.push(modifierId);
    }

    if (reporterId) {
      conditions.push('reporter_id = ?');
      params.push(reporterId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalCountQuery = `SELECT COUNT(*) as count FROM violations ${whereClause}`;
    const total = db.prepare(totalCountQuery).get(...params).count;

    const allowedSortCols = [
      'id', 'violation_number', 'violation_date', 'entry_date',
      'extractor_name', 'auditor_name', 'modifier_name', 'reporter_name', 'camera_location', 'error_type'
    ];
    const safeSortBy = allowedSortCols.includes(sortBy) ? sortBy : 'id';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let query = `
      SELECT * FROM violations
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
    `;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 15);

    if (all !== 'true' && all !== true) {
      const offset = (parsedPage - 1) * parsedLimit;
      query += ` LIMIT ${parsedLimit} OFFSET ${offset}`;
    }

    const data = db.prepare(query).all(...params);

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * جلب سجلات دور معين مع إمكانية الفلترة بموظف فردي
 */
function getViolationsByRole(req, res, next) {
  try {
    const { role } = req.params;
    const { employeeNumber, search, startDate, endDate, page = 1, limit = 15, all = false } = req.query;

    const colMap = {
      extractor: { idCol: 'extractor_id', nameCol: 'extractor_name', table: 'extractors', title: 'المستخرجين' },
      auditor: { idCol: 'auditor_id', nameCol: 'auditor_name', table: 'auditors', title: 'المدققين' },
      modifier: { idCol: 'modifier_id', nameCol: 'modifier_name', table: 'modifiers', title: 'المعدلين' },
      reporter: { idCol: 'reporter_id', nameCol: 'reporter_name', table: 'reporters', title: 'المبلغين' }
    };

    const meta = colMap[role];
    if (!meta) {
      return res.status(400).json({ success: false, message: 'الدور المحدد غير صالح' });
    }

    const conditions = [];
    const params = [];

    if (employeeNumber) {
      conditions.push(`${meta.idCol} = ?`);
      params.push(employeeNumber);
    }

    if (startDate) {
      conditions.push('violation_date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('violation_date <= ?');
      params.push(endDate);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(`(
        violation_number LIKE ? OR
        wrong_vehicle_number LIKE ? OR
        correct_vehicle_number LIKE ? OR
        ${meta.nameCol} LIKE ? OR
        camera_location LIKE ? OR
        error_type LIKE ?
      )`);
      for (let i = 0; i < 6; i++) params.push(term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const total = db.prepare(`SELECT COUNT(*) as count FROM violations ${whereClause}`).get(...params).count;

    let query = `
      SELECT * FROM violations
      ${whereClause}
      ORDER BY id DESC
    `;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 15);

    if (all !== 'true' && all !== true) {
      const offset = (parsedPage - 1) * parsedLimit;
      query += ` LIMIT ${parsedLimit} OFFSET ${offset}`;
    }

    const data = db.prepare(query).all(...params);

    const statsWhere = employeeNumber ? `WHERE ${meta.idCol} = ?` : '';
    const statsParams = employeeNumber ? [employeeNumber] : [];

    const topErrors = db.prepare(`
      SELECT error_type, COUNT(*) as count
      FROM violations
      ${statsWhere}
      GROUP BY error_type
      ORDER BY count DESC
      LIMIT 3
    `).all(...statsParams);

    const employeeList = db.prepare(`
      SELECT number, name FROM ${meta.table} WHERE is_active = 1 ORDER BY CAST(number AS INTEGER) ASC
    `).all();

    res.json({
      success: true,
      roleTitle: meta.title,
      data,
      topErrors,
      employeeList,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * رفع صورة الكاميرا للمخالفة
 */
function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'لم يتم استلام أي صورة' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'تم رفع صورة المخالفة بنجاح',
      imageUrl: fileUrl
    });
  } catch (error) {
    next(error);
  }
}

/**
 * تصدير ملف Excel (.xlsx) حقيقي منسق
 */
function exportExcel(req, res, next) {
  try {
    const rows = db.prepare(`
      SELECT 
        violation_number as "رقم المخالفة",
        violation_date as "تاريخ المخالفة",
        wrong_vehicle_number as "المركبة الخطأ",
        correct_vehicle_number as "المركبة الصحيح",
        error_type as "طبيعة الخطأ",
        camera_location as "موقع الكاميرا",
        extractor_id || ' - ' || extractor_name as "المستخرج",
        auditor_id || ' - ' || auditor_name as "المدقق",
        modifier_id || ' - ' || modifier_name as "المعدل",
        reporter_id || ' - ' || reporter_name as "المبلغ",
        entry_date as "تاريخ الإدخال",
        entry_day as "اليوم",
        notes as "ملاحظات"
      FROM violations
      ORDER BY id DESC
    `).all();

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل المخالفات');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename="Amman_Violations_${getTodayString()}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
}

/**
 * تنزيل قالب Excel فارغ للاستيراد
 */
function downloadTemplate(req, res, next) {
  try {
    const templateRows = [
      {
        'رقم المخالفة': 'GAM-2026-9001',
        'تاريخ المخالفة': '2026-09-06',
        'المركبة الخطأ': '50-12345',
        'المركبة الصحيح': '50-12348',
        'طبيعة الخطأ': 'خطأ في قراءة اللوحة',
        'موقع الكاميرا': 'شارع الأردن - دوار الاستقلال',
        'رقم المستخرج': '101',
        'اسم المستخرج': 'عمر العبداللات',
        'رقم المدقق': '201',
        'اسم المدقق': 'عبد الله النسور',
        'رقم المعدل': '301',
        'اسم المعدل': 'محمد الرواشدة',
        'رقم المبلغ': '401',
        'اسم المبلغ': 'سيف الحنيطي',
        'تاريخ الإدخال': '2026-09-06',
        'ملاحظات': 'عينة نموذج استيراد'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'قالب استيراد المخالفات');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="Amman_Violations_Template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
}

/**
 * استيراد دفعة مخالفات من ملف Excel (.xlsx)
 */
function importExcel(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'يرجى اختيار ملف Excel للاستيراد' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return res.status(400).json({ success: false, message: 'الملف فارغ أو لا يحتوي على صفوف بيانات' });
    }

    let imported = 0;
    let skipped = 0;
    const errors = [];

    const insertStmt = db.prepare(`
      INSERT INTO violations (
        violation_number, violation_date, wrong_vehicle_number, correct_vehicle_number,
        error_type, extractor_id, extractor_name, auditor_id, auditor_name,
        modifier_id, modifier_name, reporter_id, reporter_name,
        camera_location, entry_date, entry_day, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const checkStmt = db.prepare('SELECT id FROM violations WHERE violation_number = ?');

    const insertTransaction = db.transaction((rows) => {
      for (const row of rows) {
        const num = (row['رقم المخالفة'] || row['violation_number'] || '').toString().trim();
        if (!num) {
          skipped++;
          continue;
        }

        const exists = checkStmt.get(num);
        if (exists) {
          skipped++;
          errors.push(`رقم المخالفة (${num}) مسجل مسبقاً`);
          continue;
        }

        const vDate = (row['تاريخ المخالفة'] || row['violation_date'] || getTodayString()).toString().trim();
        const wrong = (row['المركبة الخطأ'] || row['wrong_vehicle_number'] || '').toString().trim();
        const correct = (row['المركبة الصحيح'] || row['correct_vehicle_number'] || '').toString().trim();
        const errType = (row['طبيعة الخطأ'] || row['error_type'] || 'خطأ في قراءة اللوحة').toString().trim();
        const location = (row['موقع الكاميرا'] || row['camera_location'] || 'شارع الأردن - دوار الاستقلال').toString().trim();

        const extId = (row['رقم المستخرج'] || row['extractor_id'] || '101').toString().trim();
        const extName = (row['اسم المستخرج'] || row['extractor_name'] || '').toString().trim();
        const audId = (row['رقم المدقق'] || row['auditor_id'] || '201').toString().trim();
        const audName = (row['اسم المدقق'] || row['auditor_name'] || '').toString().trim();
        const modId = (row['رقم المعدل'] || row['modifier_id'] || '301').toString().trim();
        const modName = (row['اسم المعدل'] || row['modifier_name'] || '').toString().trim();
        const repId = (row['رقم المبلغ'] || row['reporter_id'] || '401').toString().trim();
        const repName = (row['اسم المبلغ'] || row['reporter_name'] || '').toString().trim();

        const eDate = (row['تاريخ الإدخال'] || row['entry_date'] || getTodayString()).toString().trim();
        const eDay = getArabicDayName(eDate);
        const notes = (row['ملاحظات'] || row['notes'] || '').toString().trim();

        insertStmt.run(
          num, vDate, wrong, correct, errType,
          extId, extName, audId, audName, modId, modName, repId, repName,
          location, eDate, eDay, notes
        );
        imported++;
      }
    });

    insertTransaction(data);

    // حذف الملف المؤقت المرفوع
    try { fs.unlinkSync(req.file.path); } catch {}

    logAction({
      req,
      action: 'استيراد جماعي من Excel',
      entity: 'violations',
      details: `تم استيراد ${imported} مخالفة، وتجاوز ${skipped} مخالفة`
    });

    res.json({
      success: true,
      message: `تمت معالجة الملف بنجاح: تم استيراد (${imported}) مخالفة وتجاوز (${skipped}) مخالفة مكررة`,
      importedCount: imported,
      skippedCount: skipped,
      errors: errors.slice(0, 5)
    });
  } catch (error) {
    next(error);
  }
}

function getViolationById(req, res, next) {
  try {
    const { id } = req.params;
    const violation = db.prepare('SELECT * FROM violations WHERE id = ?').get(id);

    if (!violation) {
      return res.status(404).json({ success: false, message: 'المخالفة غير موجودة' });
    }

    res.json({
      success: true,
      data: violation
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  checkViolationNumber,
  createViolation,
  getViolations,
  getViolationsByRole,
  getViolationById,
  uploadImage,
  exportExcel,
  downloadTemplate,
  importExcel
};
