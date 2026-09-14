const db = require('../config/database');
const { logAction } = require('../utils/auditLogger');

function getLocations(req, res, next) {
  try {
    const locations = db.prepare(`
      SELECT id, code, name, zone, is_active, created_at
      FROM camera_locations
      WHERE is_active = 1
      ORDER BY zone ASC, name ASC
    `).all();

    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    next(error);
  }
}

function createLocation(req, res, next) {
  try {
    const { code, name, zone } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'اسم موقع الكاميرا مطلوب' });
    }

    const cleanCode = code ? code.trim().toUpperCase() : null;
    const cleanName = name.trim();
    const cleanZone = zone ? zone.trim() : 'عمان';

    const existing = db.prepare('SELECT id FROM camera_locations WHERE name = ?').get(cleanName);
    if (existing) {
      return res.status(400).json({ success: false, message: 'موقع الكاميرا هذا مضاف مسبقاً' });
    }

    const info = db.prepare('INSERT INTO camera_locations (code, name, zone) VALUES (?, ?, ?)').run(cleanCode, cleanName, cleanZone);

    logAction({
      req,
      action: 'إضافة موقع كاميرا',
      entity: 'camera_locations',
      entityId: info.lastInsertRowid,
      details: `إضافة موقع: ${cleanName} (${cleanZone}) [رمز: ${cleanCode || 'غير محدد'}]`
    });

    res.status(201).json({
      success: true,
      message: 'تمت إضافة موقع الكاميرا بنجاح',
      data: { id: info.lastInsertRowid, code: cleanCode, name: cleanName, zone: cleanZone }
    });
  } catch (error) {
    next(error);
  }
}

function deleteLocation(req, res, next) {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM camera_locations WHERE id = ?').run(id);

    logAction({
      req,
      action: 'حذف موقع كاميرا',
      entity: 'camera_locations',
      entityId: id,
      details: `حذف موقع الكاميرا رقم ${id}`
    });

    res.json({
      success: true,
      message: 'تم حذف موقع الكاميرا بنجاح'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * إدراج مواقع كاميرات متعددة دفعة واحدة (Bulk Locations)
 */
function bulkCreateLocations(req, res, next) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'لم يتم إرسال أي مواقع صالحة للإدراج' });
    }

    const checkStmt = db.prepare('SELECT id FROM camera_locations WHERE name = ?');
    const insertStmt = db.prepare('INSERT INTO camera_locations (code, name, zone, is_active) VALUES (?, ?, ?, 1)');
    const updateStmt = db.prepare('UPDATE camera_locations SET code = ?, zone = ?, is_active = 1 WHERE name = ?');

    let insertedCount = 0;
    let updatedCount = 0;

    const runBulk = db.transaction((list) => {
      for (const item of list) {
        const name = String(item.name || '').trim();
        const code = item.code ? String(item.code).trim().toUpperCase() : null;
        const zone = item.zone ? String(item.zone).trim() : 'عمّان';
        if (!name) continue;

        const existing = checkStmt.get(name);
        if (existing) {
          updateStmt.run(code, zone, name);
          updatedCount++;
        } else {
          insertStmt.run(code, name, zone);
          insertedCount++;
        }
      }
    });

    runBulk(items);

    logAction({
      req,
      action: 'إدراج مواقع كاميرات جماعي',
      entity: 'camera_locations',
      details: `إدراج (${insertedCount}) وتحديث (${updatedCount}) موقع كاميرا`
    });

    res.json({
      success: true,
      message: `تمت المعالجة بنجاح: تم إدراج (${insertedCount}) وتحديث (${updatedCount}) موقع كاميرا`,
      inserted: insertedCount,
      updated: updatedCount,
      total: insertedCount + updatedCount
    });
  } catch (error) {
    next(error);
  }
}

/**
 * تعديل موقع كاميرا
 */
function updateLocation(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, zone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'اسم موقع الكاميرا مطلوب' });
    }

    const cleanCode = code ? code.trim().toUpperCase() : null;
    const cleanName = name.trim();
    const cleanZone = zone ? zone.trim() : 'عمّان';

    const existing = db.prepare('SELECT * FROM camera_locations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'موقع الكاميرا غير موجود' });
    }

    if (cleanName !== existing.name) {
      const duplicate = db.prepare('SELECT id FROM camera_locations WHERE name = ? AND id != ?').get(cleanName, id);
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'موقع كاميرا بهذا الاسم مسجل مسبقاً' });
      }
    }

    db.prepare('UPDATE camera_locations SET code = ?, name = ?, zone = ? WHERE id = ?').run(cleanCode, cleanName, cleanZone, id);

    // تحديث المخالفات المسجلة بهذا الموقع إن تغير الاسم أو الرمز
    try {
      if (cleanName !== existing.name || cleanCode !== existing.code) {
        db.prepare('UPDATE violations SET camera_location = ?, location_code = ? WHERE camera_location = ?')
          .run(cleanName, cleanCode, existing.name);
      }
    } catch (err) {
      console.error('ملاحظة أثناء تحديث المخالفات بموقع الكاميرا الجديد:', err.message);
    }

    logAction({
      req,
      action: 'تعديل موقع كاميرا',
      entity: 'camera_locations',
      entityId: id,
      details: `تعديل موقع: من (${existing.name} [${existing.code || '-'}]) إلى (${cleanName} [${cleanCode || '-'}])`
    });

    res.json({
      success: true,
      message: 'تم تحديث موقع الكاميرا بنجاح'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  bulkCreateLocations
};
