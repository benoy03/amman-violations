import api from '../api/axiosInstance';

/**
 * تنزيل الملفات بأمان باستخدام Axios مع ترويسة المصادقة Bearer Token
 * يحل مشكلة window.open التي تفشل مع المسارات المحمية
 */
export async function downloadSecureFile(url, fallbackFilename = 'download.xlsx', params = {}) {
  try {
    const response = await api.get(url, {
      params,
      responseType: 'blob'
    });

    // محاولة استخراج اسم الملف من ترويسة Content-Disposition إن وجدت
    let filename = fallbackFilename;
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, '');
      }
    }

    // إنشاء رابط وهمي في الذاكرة لتنزيل الملف
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/octet-stream'
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true, filename };
  } catch (error) {
    console.error('فشل تنزيل الملف:', error);
    let message = 'فشل تنزيل الملف من الخادم';
    if (error.response && error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        if (json.message) message = json.message;
      } catch {
        // ignore
      }
    } else if (error.message) {
      message = error.message;
    }
    throw new Error(message);
  }
}
