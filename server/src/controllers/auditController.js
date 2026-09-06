const db = require('../config/database');

function getAuditLogs(req, res, next) {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push('(username LIKE ? OR action LIKE ? OR entity LIKE ? OR details LIKE ?)');
      params.push(term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const total = db.prepare(`SELECT COUNT(*) as count FROM audit_logs ${whereClause}`).get(...params).count;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 20);
    const offset = (parsedPage - 1) * parsedLimit;

    const rows = db.prepare(`
      SELECT * FROM audit_logs
      ${whereClause}
      ORDER BY id DESC
      LIMIT ${parsedLimit} OFFSET ${offset}
    `).all(...params);

    res.json({
      success: true,
      data: rows,
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

module.exports = {
  getAuditLogs
};
