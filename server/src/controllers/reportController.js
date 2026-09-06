const db = require('../config/database');
const { getDateRange } = require('../utils/dateUtils');

/**
 * تقرير الإحصائيات الشاملة ومواقع الكاميرات
 */
function getStatistics(req, res, next) {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    const range = getDateRange(period, startDate, endDate);

    const dateParams = [range.startDate, range.endDate];
    const dateFilter = `WHERE violation_date >= ? AND violation_date <= ?`;

    const totalViolations = db.prepare(`
      SELECT COUNT(*) as count FROM violations ${dateFilter}
    `).get(...dateParams).count;

    const overallTotal = db.prepare(`SELECT COUNT(*) as count FROM violations`).get().count;

    // 1. تحليل طبيعة الأخطاء
    const errorTypesStats = db.prepare(`
      SELECT 
        error_type, 
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / MAX(1, ?)), 1) as percentage
      FROM violations
      ${dateFilter}
      GROUP BY error_type
      ORDER BY count DESC
    `).all(totalViolations, ...dateParams);

    // 2. تحليل مواقع الكاميرات (Amman Camera Hotspots)
    const cameraLocationsStats = db.prepare(`
      SELECT 
        COALESCE(camera_location, 'غير محدد') as location,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / MAX(1, ?)), 1) as percentage
      FROM violations
      ${dateFilter}
      GROUP BY camera_location
      ORDER BY count DESC
    `).all(totalViolations, ...dateParams);

    // 3. جدول المستخرجين
    const extractorsStats = db.prepare(`
      SELECT 
        extractor_id as number,
        extractor_name as name,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / MAX(1, ?)), 1) as percentage
      FROM violations
      ${dateFilter}
      GROUP BY extractor_id, extractor_name
      ORDER BY count DESC
    `).all(totalViolations, ...dateParams);

    // 4. جدول المدققين
    const auditorsStats = db.prepare(`
      SELECT 
        auditor_id as number,
        auditor_name as name,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / MAX(1, ?)), 1) as percentage
      FROM violations
      ${dateFilter}
      GROUP BY auditor_id, auditor_name
      ORDER BY count DESC
    `).all(totalViolations, ...dateParams);

    // 5. جدول المعدلين
    const modifiersStats = db.prepare(`
      SELECT 
        modifier_id as number,
        modifier_name as name,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / MAX(1, ?)), 1) as percentage
      FROM violations
      ${dateFilter}
      GROUP BY modifier_id, modifier_name
      ORDER BY count DESC
    `).all(totalViolations, ...dateParams);

    // 6. جدول المبلغين
    const reportersStats = db.prepare(`
      SELECT 
        reporter_id as number,
        reporter_name as name,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / MAX(1, ?)), 1) as percentage
      FROM violations
      ${dateFilter}
      GROUP BY reporter_id, reporter_name
      ORDER BY count DESC
    `).all(totalViolations, ...dateParams);

    // 7. المقارنة البصرية للرسم البياني
    const comparisonSeries = [
      {
        role: 'المستخرجون',
        count: extractorsStats.reduce((sum, item) => sum + item.count, 0),
        color: '#1e40af'
      },
      {
        role: 'المدققون',
        count: auditorsStats.reduce((sum, item) => sum + item.count, 0),
        color: '#0284c7'
      },
      {
        role: 'المعدلون',
        count: modifiersStats.reduce((sum, item) => sum + item.count, 0),
        color: '#0d9488'
      },
      {
        role: 'المبلغون',
        count: reportersStats.reduce((sum, item) => sum + item.count, 0),
        color: '#e11d48'
      }
    ];

    const topExtractor = extractorsStats[0] || null;
    const topAuditor = auditorsStats[0] || null;
    const topModifier = modifiersStats[0] || null;
    const topReporter = reportersStats[0] || null;
    const mostCommonError = errorTypesStats[0] || null;
    const topCameraHotspot = cameraLocationsStats[0] || null;

    res.json({
      success: true,
      period,
      dateRange: {
        label: range.label,
        startDate: range.startDate,
        endDate: range.endDate
      },
      summary: {
        totalViolationsInPeriod: totalViolations,
        overallTotal,
        mostCommonError,
        topExtractor,
        topAuditor,
        topModifier,
        topReporter,
        topCameraHotspot
      },
      comparisonSeries,
      errorTypesStats,
      cameraLocationsStats,
      extractorsStats,
      auditorsStats,
      modifiersStats,
      reportersStats
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStatistics
};
