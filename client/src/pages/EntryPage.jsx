import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { getArabicDayName, getTodayDateString } from '../utils/dateHelpers';
import JordanianPlate from '../components/JordanianPlate';
import PlateDiffViewer from '../components/PlateDiffViewer';
import {
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Table,
  Search,
  UserCheck,
  FileEdit,
  Radio,
  BarChart3,
  Printer,
  Calendar,
  Car,
  User,
  Building2,
  Camera,
  MapPin,
  Upload,
  Image as ImageIcon,
  Eye,
  X
} from 'lucide-react';

const COMMON_ERROR_TYPES = [
  'خطأ في قراءة اللوحة',
  'لوحة غير مطابقة',
  'خطأ في الحروف / الرمز',
  'خطأ في الأرقام',
  'تبديل في الأرقام',
  'نوع المركبة مختلف (خصوصي / عمومي / شحن)',
  'تجاوز مسار خاطئ',
  'عدم وضوح الصورة من الكاميرا',
  'أخرى'
];

export default function EntryPage() {
  const navigate = useNavigate();

  const today = getTodayDateString();
  const initialFormState = {
    violation_number: '',
    violation_date: today,
    wrong_vehicle_number: '',
    correct_vehicle_number: '',
    error_type: '',
    custom_error_type: '',
    camera_location: 'شارع الأردن - دوار الاستقلال',
    image_url: '',
    extractor_id: '',
    extractor_name: '',
    auditor_id: '',
    auditor_name: '',
    modifier_id: '',
    modifier_name: '',
    reporter_id: '',
    reporter_name: '',
    entry_date: today,
    entry_day: getArabicDayName(today),
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [extractors, setExtractors] = useState([]);
  const [auditors, setAuditors] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [reporters, setReporters] = useState([]);
  const [locations, setLocations] = useState([]);

  const [numberStatus, setNumberStatus] = useState({ checking: false, exists: false, message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const violationInputRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [extRes, audRes, modRes, repRes, locRes] = await Promise.all([
          api.get('/employees/extractors'),
          api.get('/employees/auditors'),
          api.get('/employees/modifiers'),
          api.get('/employees/reporters'),
          api.get('/locations')
        ]);
        setExtractors(extRes.data.data || []);
        setAuditors(audRes.data.data || []);
        setModifiers(modRes.data.data || []);
        setReporters(repRes.data.data || []);
        setLocations(locRes.data.data || []);
      } catch (err) {
        console.error('فشل جلب القوائم:', err);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const num = formData.violation_number.trim();
    if (!num) {
      setNumberStatus({ checking: false, exists: false, message: '' });
      return;
    }

    const timer = setTimeout(async () => {
      setNumberStatus({ checking: true, exists: false, message: 'جاري التحقق من الرقم...' });
      try {
        const res = await api.get(`/violations/check-number/${encodeURIComponent(num)}`);
        if (res.data.exists) {
          setNumberStatus({
            checking: false,
            exists: true,
            message: '⚠️ رقم المخالفة مسجل مسبقاً في النظام!'
          });
        } else {
          setNumberStatus({
            checking: false,
            exists: false,
            message: '✅ رقم المخالفة متاح وجديد'
          });
        }
      } catch {
        setNumberStatus({ checking: false, exists: false, message: '' });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.violation_number]);

  const handleEntryDateChange = (e) => {
    const newDate = e.target.value;
    setFormData((prev) => ({
      ...prev,
      entry_date: newDate,
      entry_day: getArabicDayName(newDate)
    }));
  };

  const handleEmployeeChange = (role, id, list) => {
    const emp = list.find((item) => String(item.number) === String(id));
    const name = emp ? emp.name : '';

    setFormData((prev) => ({
      ...prev,
      [`${role}_id`]: id,
      [`${role}_name`]: name
    }));
  };

  // رفع صورة الكاميرا
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await api.post('/violations/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData((prev) => ({ ...prev, image_url: res.data.imageUrl }));
      setAlert({ show: true, type: 'success', message: 'تم إرفاق صورة الكاميرا بنجاح' });
    } catch {
      setAlert({ show: true, type: 'error', message: 'فشل رفع الصورة' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ show: false, type: '', message: '' });

    if (numberStatus.exists) {
      setAlert({
        show: true,
        type: 'error',
        message: 'لا يمكن الترحيل: رقم المخالفة مسجل مسبقاً! يرجى إدخال رقم جديد.'
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/violations', formData);
      setAlert({
        show: true,
        type: 'success',
        message: `تم الترحيل بنجاح! تم تسجيل المخالفة برقم: ${formData.violation_number}`
      });

      setFormData({
        ...initialFormState,
        entry_date: today,
        entry_day: getArabicDayName(today)
      });
      setNumberStatus({ checking: false, exists: false, message: '' });

      if (violationInputRef.current) {
        violationInputRef.current.focus();
      }
    } catch (err) {
      setAlert({
        show: true,
        type: 'error',
        message: err.response?.data?.message || 'حدث خطأ أثناء ترحيل البيانات، يرجى المحاولة ثانية'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة مع العنوان الرسمي */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-100 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>أمانة عمّان الكبرى</span>
            </span>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              قسم المخالفات والرقابة الآلية
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            كشف تعديل مخالفات الكاميرات الرقابية
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدخال وتدقيق بيانات تعديل مخالفات كاميرات الرقابة مع مقارنة بصرية ذكية للوحات الأردنية
          </p>
        </div>

        <div className="no-print flex items-center gap-2">
          <button
            onClick={() => window.print()}
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition shadow-sm border border-slate-300"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>طباعة النموذج</span>
          </button>
        </div>
      </div>

      {/* تنبيه إذا كانت قوائم الموظفين فارغة */}
      {extractors.length === 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900 font-bold">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>النظام جاهز ونظيف 100%! يرجى من مدير النظام التوجه أولاً إلى شاشة (إدارة الموظفين) لإضافة أرقام وأسماء الكادر الفعلي (المستخرجين والمدققين والمعدلين والمبلغين) لتظهر تلقائياً في القوائم.</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/employees')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-sm"
          >
            إضافة كادر الموظفين الآن
          </button>
        </div>
      )}

      {/* تنبيهات النجاح أو الخطأ */}
      {alert.show && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300 ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
          )}
          <div className="flex-1">{alert.message}</div>
          <button
            onClick={() => setAlert({ show: false, type: '', message: '' })}
            className="text-xs underline hover:opacity-80"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* استمارة الإدخال الرئيسية */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/90 space-y-8">
        {/* القسم 1: بيانات المخالفة والمركبة */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-100 text-brand-900 font-black text-base">
            <Car className="w-5 h-5 text-brand-600" />
            <span>بيانات المخالفة والمركبة والكاميرا</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. رقم المخالفة */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                1. رقم المخالفة <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={violationInputRef}
                  type="text"
                  required
                  placeholder="مثال: GAM-2026-1050"
                  value={formData.violation_number}
                  onChange={(e) => setFormData({ ...formData, violation_number: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition ${
                    numberStatus.exists
                      ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-2 focus:ring-rose-400'
                      : 'border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'
                  }`}
                />
              </div>
              {numberStatus.message && (
                <p
                  className={`text-xs mt-1.5 font-bold ${
                    numberStatus.exists ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {numberStatus.message}
                </p>
              )}
            </div>

            {/* 2. تاريخ المخالفة */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                2. تاريخ المخالفة <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.violation_date}
                onChange={(e) => setFormData({ ...formData, violation_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm font-semibold outline-none"
              />
            </div>

            {/* موقع الكاميرا في عمّان */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>موقع الكاميرا (عمّان) <span className="text-red-500">*</span></span>
              </label>
              {locations.length > 0 ? (
                <select
                  value={formData.camera_location}
                  onChange={(e) => setFormData({ ...formData, camera_location: e.target.value })}
                  className="w-full px-3 py-3 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="">-- اختر موقع الكاميرا --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name} ({loc.zone})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="أدخل موقع الكاميرا أو الشارع..."
                  value={formData.camera_location}
                  onChange={(e) => setFormData({ ...formData, camera_location: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500"
                />
              )}
            </div>

            {/* 3. رقم المركبة الخطأ */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                3. رقم المركبة الخطأ (لوحة أردنية) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: 50-98432 أو 10-12456"
                value={formData.wrong_vehicle_number}
                onChange={(e) => setFormData({ ...formData, wrong_vehicle_number: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm font-semibold outline-none"
              />
            </div>

            {/* 4. رقم المركبة الصحيح */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                4. رقم المركبة الصحيح (بعد التدقيق) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: 50-98423 أو 10-12458"
                value={formData.correct_vehicle_number}
                onChange={(e) => setFormData({ ...formData, correct_vehicle_number: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm font-semibold outline-none"
              />
            </div>

            {/* 5. طبيعة الخطأ */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                5. طبيعة الخطأ <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.error_type}
                onChange={(e) => setFormData({ ...formData, error_type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm font-bold outline-none bg-white"
              >
                <option value="">-- اختر طبيعة الخطأ من القائمة --</option>
                {COMMON_ERROR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {formData.error_type === 'أخرى' && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                  <label className="block text-xs font-bold text-brand-700 mb-1">
                    حدد طبيعة الخطأ بالتفصيل:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="اكتب وصف طبيعة الخطأ هنا..."
                    value={formData.custom_error_type}
                    onChange={(e) => setFormData({ ...formData, custom_error_type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-300 bg-brand-50/50 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
              )}
            </div>

            {/* إرفاق صورة الكاميرا */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-brand-600" />
                <span>صورة الكاميرا (اختياري)</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 px-3 py-2.5 border border-dashed border-slate-300 hover:border-brand-500 rounded-xl text-center cursor-pointer bg-slate-50 hover:bg-brand-50/30 text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-brand-600" />
                  <span>{uploadingImage ? 'جاري الرفع...' : formData.image_url ? 'تغيير الصورة' : 'إرفاق صورة'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {formData.image_url && (
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(true)}
                    className="p-2.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl hover:bg-brand-100"
                    title="معاينة الصورة"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* المقارن البصري الذكي للوحات الأردنية (يظهر تلقائياً عند كتابة الأرقام) */}
          {(formData.wrong_vehicle_number || formData.correct_vehicle_number) && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-2">
              <PlateDiffViewer
                wrongPlate={formData.wrong_vehicle_number}
                correctPlate={formData.correct_vehicle_number}
                errorType={formData.error_type}
              />
            </div>
          )}
        </div>

        {/* القسم 2: بيانات الموظفين (المستخرج، المدقق، المعدل، المبلغ) */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-100 text-brand-900 font-black text-base">
            <User className="w-5 h-5 text-brand-600" />
            <span>فريق العمل والمسؤولون عن السجل</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* المستخرج */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-extrabold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-md">
                فريق الاستخراج
              </span>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  6. رقم المستخرج <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.extractor_id}
                  onChange={(e) => handleEmployeeChange('extractor', e.target.value, extractors)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="">-- اختر الرقم --</option>
                  {extractors.map((ext) => (
                    <option key={ext.id} value={ext.number}>
                      {ext.number} - {ext.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  7. اسم المستخرج (تلقائي)
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="يظهر تلقائياً..."
                  value={formData.extractor_name}
                  className="w-full px-3 py-2 rounded-xl bg-slate-200/60 border border-slate-300 text-xs font-bold text-slate-700 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* المدقق */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-extrabold text-sky-800 bg-sky-100/70 px-2 py-0.5 rounded-md">
                فريق التدقيق
              </span>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  8. رقم المدقق <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.auditor_id}
                  onChange={(e) => handleEmployeeChange('auditor', e.target.value, auditors)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-sky-400 outline-none"
                >
                  <option value="">-- اختر الرقم --</option>
                  {auditors.map((aud) => (
                    <option key={aud.id} value={aud.number}>
                      {aud.number} - {aud.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  9. اسم المدقق (تلقائي)
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="يظهر تلقائياً..."
                  value={formData.auditor_name}
                  className="w-full px-3 py-2 rounded-xl bg-slate-200/60 border border-slate-300 text-xs font-bold text-slate-700 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* المعدل */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-extrabold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md">
                فريق التعديل
              </span>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  10. رقم المعدل <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.modifier_id}
                  onChange={(e) => handleEmployeeChange('modifier', e.target.value, modifiers)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-teal-400 outline-none"
                >
                  <option value="">-- اختر الرقم --</option>
                  {modifiers.map((mod) => (
                    <option key={mod.id} value={mod.number}>
                      {mod.number} - {mod.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  11. اسم المعدل (تلقائي)
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="يظهر تلقائياً..."
                  value={formData.modifier_name}
                  className="w-full px-3 py-2 rounded-xl bg-slate-200/60 border border-slate-300 text-xs font-bold text-slate-700 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* المبلغ */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-extrabold text-rose-800 bg-rose-100/70 px-2 py-0.5 rounded-md">
                فريق التبليغ
              </span>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  12. رقم المبلغ <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.reporter_id}
                  onChange={(e) => handleEmployeeChange('reporter', e.target.value, reporters)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-rose-400 outline-none"
                >
                  <option value="">-- اختر الرقم --</option>
                  {reporters.map((rep) => (
                    <option key={rep.id} value={rep.number}>
                      {rep.number} - {rep.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  13. اسم المبلغ (تلقائي)
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="يظهر تلقائياً..."
                  value={formData.reporter_name}
                  className="w-full px-3 py-2 rounded-xl bg-slate-200/60 border border-slate-300 text-xs font-bold text-slate-700 outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* القسم 3: تاريخ ويوم الإدخال والملاحظات */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-100 text-brand-900 font-black text-base">
            <Calendar className="w-5 h-5 text-brand-600" />
            <span>بيانات الإدخال والتوثيق</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 14. التاريخ */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                14. التاريخ (تاريخ الإدخال)
              </label>
              <input
                type="date"
                required
                value={formData.entry_date}
                onChange={handleEntryDateChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm font-semibold outline-none"
              />
            </div>

            {/* 15. اليوم */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                15. اليوم (محسوب تلقائياً بالعربية)
              </label>
              <input
                type="text"
                readOnly
                value={formData.entry_day}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-300 text-sm font-black text-brand-800 outline-none cursor-not-allowed"
              />
            </div>

            {/* ملاحظات إضافية */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                ملاحظات إضافية (اختياري)
              </label>
              <input
                type="text"
                placeholder="تفاصيل التدقيق أو سبب التعديل..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm font-medium outline-none"
              />
            </div>
          </div>
        </div>

        {/* زر الترحيل الرئيسي */}
        <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            * الحقول الموسومة بعلامة (<span className="text-red-500">*</span>) إلزامية قبل الترحيل.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setFormData(initialFormState);
                setNumberStatus({ checking: false, exists: false, message: '' });
                setAlert({ show: false, type: '', message: '' });
              }}
              className="px-4 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>تفريغ الحقول</span>
            </button>

            <button
              type="submit"
              disabled={submitting || numberStatus.exists}
              className="flex-1 sm:flex-none px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-xl transition-all duration-200 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>{submitting ? 'جاري الترحيل...' : 'ترحيل المعلومات (حفظ المخالفة)'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* نافذة معاينة صورة الكاميرا المكبرة */}
      {previewZoom && formData.image_url && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl p-4 border border-slate-700">
            <button
              onClick={() => setPreviewZoom(false)}
              className="absolute left-4 top-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-bold text-white mb-3 text-right">
              معاينة صورة كاميرا المخالفة (أمانة عمّان)
            </h4>
            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
              <img src={formData.image_url} alt="Camera Violation" className="max-h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* شريط الأزرار السريعة */}
      <div className="no-print bg-slate-200/70 p-4 rounded-2xl border border-slate-300/80">
        <p className="text-xs font-bold text-slate-600 mb-3">أزرار الوصول السريع للشيتات والصفحات:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => navigate('/violations')}
            className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-brand-50 text-slate-800 hover:text-brand-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm transition"
          >
            <Table className="w-4 h-4 text-brand-600" />
            <span>عرض سجل المخالفات</span>
          </button>

          <button
            onClick={() => navigate('/sheet/extractor')}
            className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm transition"
          >
            <Search className="w-4 h-4 text-blue-600" />
            <span>صفحة المستخرجين</span>
          </button>

          <button
            onClick={() => navigate('/sheet/auditor')}
            className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-sky-50 text-slate-800 hover:text-sky-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm transition"
          >
            <UserCheck className="w-4 h-4 text-sky-600" />
            <span>صفحة المدققين</span>
          </button>

          <button
            onClick={() => navigate('/sheet/modifier')}
            className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-teal-50 text-slate-800 hover:text-teal-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm transition"
          >
            <FileEdit className="w-4 h-4 text-teal-600" />
            <span>صفحة المعدلين</span>
          </button>

          <button
            onClick={() => navigate('/sheet/reporter')}
            className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-rose-50 text-slate-800 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm transition"
          >
            <Radio className="w-4 h-4 text-rose-600" />
            <span>صفحة المبلغ</span>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-purple-50 text-slate-800 hover:text-purple-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm transition"
          >
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>صفحة التقارير</span>
          </button>
        </div>
      </div>
    </div>
  );
}
