import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import { Edit3, X, CheckCircle2, User, MapPin } from 'lucide-react';

export default function EditEmployeeModal({
  isOpen,
  onClose,
  item,
  isLocation = false,
  role = 'extractors',
  onSuccess
}) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [code, setCode] = useState('');
  const [zone, setZone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toast = useToast();

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setNumber(item.number || '');
      setCode(item.code || '');
      setZone(item.zone || '');
      setError('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (isLocation) {
        await api.put(`/locations/${item.id}`, {
          name: name.trim(),
          code: code.trim().toUpperCase() || null,
          zone: zone.trim() || 'عمّان'
        });
        toast.success('تم تحديث موقع الكاميرا بنجاح');
      } else {
        await api.put(`/employees/${role}/${encodeURIComponent(item.number)}`, {
          newNumber: number.trim(),
          name: name.trim()
        });
        toast.success('تم تحديث بيانات الموظف بنجاح');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-brand-50 text-brand-700 rounded-2xl border border-brand-100">
            {isLocation ? <MapPin className="w-6 h-6" /> : <Edit3 className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              {isLocation ? 'تعديل موقع الكاميرا' : 'تعديل بيانات الموظف'}
            </h3>
            <p className="text-xs text-slate-500">
              {isLocation ? `تعديل الموقع: ${item.name}` : `تعديل الموظف: ${item.name}`}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLocation ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الرقم الوظيفي / الكود
                </label>
                <input
                  type="text"
                  required
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="مثال: 105"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold font-mono focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم الموظف الكامل
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="الاسم الثلاثي أو الرباعي"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رمز الموقع (الكود الفريد)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="مثال: CAM-01"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم موقع الكاميرا
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: شارع الأردن - دوار الاستقلال"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  المنطقة / القطاع في عمّان
                </label>
                <input
                  type="text"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  placeholder="مثال: وسط عمّان"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:border-brand-500 outline-none"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
