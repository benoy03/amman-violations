const db = require('../config/database');
const { logAction } = require('../utils/auditLogger');

function getLocations(req, res, next) {
  try {
    const locations = db.prepare(`
      SELECT id, name, zone, is_active, created_at
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
    const { name, zone } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'اسم موقع الكاميرا مطلوب' });
    }

    const cleanName = name.trim();
    const cleanZone = zone ? zone.trim() : 'عمان';

    const existing = db.prepare('SELECT id FROM camera_locations WHERE name = ?').get(cleanName);
    if (existing) {
      return res.status(400).json({ success: false, message: 'موقع الكاميرا هذا مضاف مسبقاً' });
    }

    const info = db.prepare('INSERT INTO camera_locations (name, zone) VALUES (?, ?)').run(cleanName, cleanZone);

    logAction({
      req,
      action: 'إضافة موقع كاميرا',
      entity: 'camera_locations',
      entityId: info.lastInsertRowid,
      details: `إضافة موقع: ${cleanName} (${cleanZone})`
    });

    res.status(201).json({
      success: true,
      message: 'تمت إضافة موقع الكاميرا بنجاح',
      data: { id: info.lastInsertRowid, name: cleanName, zone: cleanZone }
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
    const insertStmt = db.prepare('INSERT INTO camera_locations (name, zone, is_active) VALUES (?, ?, 1)');
    const updateStmt = db.prepare('UPDATE camera_locations SET zone = ?, is_active = 1 WHERE name = ?');

    let insertedCount = 0;
    let updatedCount = 0;

    const runBulk = db.transaction((list) => {
      for (const item of list) {
        const name = String(item.name || '').trim();
        const zone = item.zone ? String(item.zone).trim() : 'عمّان';
        if (!name) continue;

        const existing = checkStmt.get(name);
        if (existing) {
          updateStmt.run(zone, name);
          updatedCount++;
        } else {
          insertStmt.run(name, zone);
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

module.exports = {
  getLocations,
  createLocation,
  deleteLocation,
  bulkCreateLocations
};
