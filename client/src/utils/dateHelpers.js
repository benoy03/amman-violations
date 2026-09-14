export const ARABIC_DAYS = [
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
 * ملاحظة: نتجنب new Date('YYYY-MM-DD') التي تُعامل التاريخ كـ UTC مما يسبب خطأ في اليوم بتوقيت عمّان (UTC+3)
 */
export function getArabicDayName(dateString) {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length !== 3) return '';
    // إنشاء التاريخ بالتوقيت المحلي عبر إضافة T00:00:00 (بدون Z لتجنب UTC)
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(date.getTime())) return '';
    return ARABIC_DAYS[date.getDay()] || '';
  } catch {
    return '';
  }
}

/**
 * الحصول على تاريخ اليوم YYYY-MM-DD
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * تنسيق التاريخ للعرض العربي اللطيف
 */
export function formatDisplayDate(dateString) {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
}
