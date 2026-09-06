import React, { useState } from 'react';
import api from '../api/axiosInstance';
import { FileSpreadsheet, UploadCloud, Download, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ExcelImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    window.open('/api/violations/template-excel', '_blank');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('يرجى اختيار ملف Excel أولاً');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/violations/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل استيراد الملف، تحقق من صيغة الأعمدة');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              استيراد كشف مخالفات من ملف Excel
            </h3>
            <p className="text-xs text-slate-500">
              رفع ملف (.xlsx) يحتوي على سجلات متعددة وحفظها دفعة واحدة
            </p>
          </div>
        </div>

        {/* تنزيل القالب */}
        <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <p className="font-bold text-slate-800">قالب أمانة عمّان المعتمد:</p>
            <p className="text-[11px] text-slate-500">حمل القالب الرسمي وتأكد من مطابقة أسماء الأعمدة</p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-brand-700 border border-slate-300 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تحميل القالب</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-bold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1 text-emerald-800 font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{result.message}</span>
            </div>
            {result.skippedCount > 0 && (
              <p className="text-amber-700 text-[11px] pt-1">
                تنبيه: تم تجاوز {result.skippedCount} مخالفة مكررة أو فارغة لمنع تكرار البيانات.
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-brand-50/20 transition">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-file-input"
            />
            <label htmlFor="excel-file-input" className="cursor-pointer block">
              <UploadCloud className="w-10 h-10 text-brand-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                {file ? file.name : 'انقر لاختيار ملف Excel من جهازك أو اسحبه هنا'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">يدعم ملفات (.xlsx, .xls)</p>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/30 transition disabled:opacity-50 flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{uploading ? 'جاري الاستيراد...' : 'بدء استيراد البيانات'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
