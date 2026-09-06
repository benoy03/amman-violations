const db = require('../config/database');

/**
 * تسجيل حركة في سجل الرقابة والعمليات (Audit Log)
 */
function logAction({ req, action, entity, entityId, details }) {
  try {
    const userId = req?.user?.id || null;
    const username = req?.user?.username || req?.body?.username || 'النظام';

    const insertStmt = db.prepare(`
      INSERT INTO audit_logs (user_id, username, action, entity, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(userId, username, action, entity, entityId ? String(entityId) : null, details || null);
  } catch (err) {
    console.error('فشل حفظ سجل الرقابة:', err.message);
  }
}

module.exports = {
  logAction
};
