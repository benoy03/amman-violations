/**
 * دوال مساعدة للتواريخ وأيام الأسبوع باللغة العربية
 */

const arabicDays = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

/**
 * الحصول على اسم اليوم بالعربي من تاريخ YYYY-MM-DD
 */
function getArabicDayName(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  return arabicDays[dayIndex] || '';
}

/**
 * تنسيق التاريخ إلى YYYY-MM-DD
 */
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * الحصول على تاريخ اليوم YYYY-MM-DD
 */
function getTodayString() {
  return formatDate(new Date());
}

/**
 * الحصول على نطاق التاريخ بناءً على الفترة المطلوبة
 * @param {string} period 'day' | 'week' | 'month' | 'quarter' | 'half' | 'year' | 'custom'
 * @param {string} startDate YYYY-MM-DD
 * @param {string} endDate YYYY-MM-DD
 */
function getDateRange(period, startDate, endDate) {
  const today = new Date();
  let start = new Date(today);
  let end = new Date(today);

  switch (period) {
    case 'day':
      return {
        startDate: formatDate(today),
        endDate: formatDate(today),
        label: 'اليوم الحالي'
      };

    case 'week':
      start.setDate(today.getDate() - 6);
      return {
        startDate: formatDate(start),
        endDate: formatDate(end),
        label: 'آخر 7 أيام'
      };

    case 'month':
      start.setDate(1);
      return {
        startDate: formatDate(start),
        endDate: formatDate(end),
        label: 'الشهر الحالي'
      };

    case 'quarter':
      start.setMonth(today.getMonth() - 3);
      return {
        startDate: formatDate(start),
        endDate: formatDate(end),
        label: 'آخر 3 أشهر (ربع سنوي)'
      };

    case 'half':
      start.setMonth(today.getMonth() - 6);
      return {
        startDate: formatDate(start),
        endDate: formatDate(end),
        label: 'آخر 6 أشهر (نصف سنوي)'
      };

    case 'year':
      start = new Date(today.getFullYear(), 0, 1);
      return {
        startDate: formatDate(start),
        endDate: formatDate(end),
        label: 'السنة الحالية'
      };

    case 'custom':
      return {
        startDate: startDate || formatDate(today),
        endDate: endDate || formatDate(today),
        label: `فترة مخصصة (${startDate || ''} إلى ${endDate || ''})`
      };

    default:
      start.setDate(1);
      return {
        startDate: formatDate(start),
        endDate: formatDate(end),
        label: 'الشهر الحالي'
      };
  }
}

module.exports = {
  arabicDays,
  getArabicDayName,
  formatDate,
  getTodayString,
  getDateRange
};
