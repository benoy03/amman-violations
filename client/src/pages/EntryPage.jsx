import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { getArabicDayName, getTodayDateString } from '../utils/dateHelpers';
import { useToast } from '../context/ToastContext';
import JordanianPlate from '../components/JordanianPlate';
import PlateDiffViewer from '../components/PlateDiffViewer';
import {
  Save, RotateCcw, CheckCircle2, AlertCircle, Table, Search,
  UserCheck, FileEdit, Radio, BarChart3, Printer, Calendar, Car,
  User, Building2, Camera, Video, Play, MapPin, Upload, Eye, X,
  Pin, Loader2, CheckCheck
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

function SectionHeader({ icon: Icon, title, children }) {
  return (
    <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(38,104,229,0.1)' }}>
          <Icon className="w-4 h-4 text-brand-600" />
        </div>
        <span className="text-sm font-black text-slate-900">{title}</span>
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">
      {children}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  );
}

export default function EntryPage() {
  const navigate = useNavigate();
  const today = getTodayDateString();

  const initialFormState = {
    violation_number: '',
    violation_date: today,
    jurisdiction: 'سير',
    wrong_vehicle_number: '',
    correct_vehicle_number: '',
    error_type: '',
    custom_error_type: '',
    camera_location: 'شارع الأردن - دوار الاستقلال',
    location_code: 'CAM-01',
    image_url: '',
    video_url: '',
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
  const toast = useToast();
  const [pinShiftData, setPinShiftData] = useState(() => localStorage.getItem('aml_pin_shift_data') === 'true');
  const [numberStatus, setNumberStatus] = useState({ checking: false, exists: false, message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const violationInputRef = useRef(null);

  useEffect(() => { localStorage.setItem('aml_pin_shift_data', String(pinShiftData)); }, [pinShiftData]);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const formEl = document.getElementById('violation-entry-form');
        if (formEl) formEl.requestSubmit();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [extRes, audRes, modRes, repRes, locRes] = await Promise.all([
          api.get('/employees/extractors'), api.get('/employees/auditors'),
          api.get('/employees/modifiers'), api.get('/employees/reporters'),
          api.get('/locations')
        ]);
        setExtractors(extRes.data.data || []);
        setAuditors(audRes.data.data || []);
        setModifiers(modRes.data.data || []);
        setReporters(repRes.data.data || []);
        const locs = locRes.data.data || [];
        setLocations(locs);
        if (locs.length > 0) {
          setFormData((prev) => {
            const matched = locs.find((l) => l.name === prev.camera_location) || locs[0];
            return { ...prev, camera_location: prev.camera_location || matched.name, location_code: prev.location_code || matched.code || 'CAM-01' };
          });
        }
      } catch (err) { console.error('فشل جلب القوائم:', err); }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const num = formData.violation_number.trim();
    if (!num) { setNumberStatus({ checking: false, exists: false, message: '' }); return; }
    const timer = setTimeout(async () => {
      setNumberStatus({ checking: true, exists: false, message: 'جاري التحقق...' });
      try {
        const res = await api.get(`/violations/check-number/${encodeURIComponent(num)}`);
        if (res.data.exists) {
          setNumberStatus({ checking: false, exists: true, message: '⚠️ رقم المخالفة مسجل مسبقاً في النظام!' });
        } else {
          setNumberStatus({ checking: false, exists: false, message: '✅ رقم المخالفة متاح وجديد' });
        }
      } catch { setNumberStatus({ checking: false, exists: false, message: '' }); }
    }, 400);
    return () => clearTimeout(timer);
  }, [formData.violation_number]);

  const handleEntryDateChange = (e) => {
    const newDate = e.target.value;
    setFormData((prev) => ({ ...prev, entry_date: newDate, entry_day: getArabicDayName(newDate) }));
  };

  const handleLocationChange = (locName) => {
    const found = locations.find((l) => l.name === locName);
    setFormData((prev) => ({ ...prev, camera_location: locName, location_code: (found && found.code) ? found.code : (prev.location_code || '') }));
  };

  const handleEmployeeChange = (role, id, list) => {
    const emp = list.find((item) => String(item.number) === String(id));
    setFormData((prev) => ({ ...prev, [`${role}_id`]: id, [`${role}_name`]: emp ? emp.name : '' }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const data = new FormData();
    data.append('image', file);
    try {
      const res = await api.post('/violations/upload-image', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData((prev) => ({ ...prev, image_url: res.data.imageUrl }));
      toast.success('تم إرفاق صورة الكاميرا بنجاح');
    } catch { toast.error('فشل رفع الصورة'); }
    finally { setUploadingImage(false); }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingVideo(true);
    const data = new FormData();
    data.append('video', file);
    try {
      const res = await api.post('/violations/upload-video', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData((prev) => ({ ...prev, video_url: res.data.videoUrl }));
      toast.success('تم رفع مقطع الفيديو بنجاح');
    } catch { toast.error('فشل رفع مقطع الفيديو'); }
    finally { setUploadingVideo(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ show: false, type: '', message: '' });
    if (numberStatus.exists) {
      const msg = 'لا يمكن الترحيل: رقم المخالفة مسجل مسبقاً! يرجى إدخال رقم جديد.';
      toast.error(msg);
      setAlert({ show: true, type: 'error', message: msg });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/violations', formData);
      const successMsg = `تم الترحيل بنجاح! تم تسجيل المخالفة برقم: ${formData.violation_number}`;
      toast.success(successMsg);
      setAlert({ show: true, type: 'success', message: successMsg });
      if (pinShiftData) {
        setFormData((prev) => ({ ...prev, violation_number: '', wrong_vehicle_number: '', correct_vehicle_number: '', image_url: '', video_url: '', notes: '', entry_date: today, entry_day: getArabicDayName(today) }));
      } else {
        setFormData({ ...initialFormState, entry_date: today, entry_day: getArabicDayName(today) });
      }
      setNumberStatus({ checking: false, exists: false, message: '' });
      if (violationInputRef.current) violationInputRef.current.focus();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'حدث خطأ أثناء ترحيل البيانات';
      toast.error(errorMsg);
      setAlert({ show: true, type: 'error', message: errorMsg });
    } finally { setSubmitting(false); }
  };

  const inputStyle = { background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' };
  const inputFocus = (e) => { e.target.style.borderColor = '#2668e5'; e.target.style.boxShadow = '0 0 0 3px rgba(38,104,229,0.1)'; e.target.style.background = 'white'; };
  const inputBlur = (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; };

  const teamRoles = [
    { key: 'extractor', label: 'فريق الاستخراج', numLabel: '6. رقم المستخرج', nameLabel: '7. اسم المستخرج', list: extractors, color: '#1d4ed8', bg: 'rgba(59,130,246,0.07)', border: 'rgba(59,130,246,0.15)', ring: '#3b82f6' },
    { key: 'auditor', label: 'فريق التدقيق', numLabel: '8. رقم المدقق', nameLabel: '9. اسم المدقق', list: auditors, color: '#0369a1', bg: 'rgba(14,165,233,0.07)', border: 'rgba(14,165,233,0.15)', ring: '#0ea5e9' },
    { key: 'modifier', label: 'فريق التعديل', numLabel: '10. رقم المعدل', nameLabel: '11. اسم المعدل', list: modifiers, color: '#0f766e', bg: 'rgba(20,184,166,0.07)', border: 'rgba(20,184,166,0.15)', ring: '#14b8a6' },
    { key: 'reporter', label: 'فريق التبليغ', numLabel: '12. رقم المبلغ', nameLabel: '13. اسم المبلغ', list: reporters, color: '#be123c', bg: 'rgba(244,63,94,0.07)', border: 'rgba(244,63,94,0.15)', ring: '#f43f5e' },
  ];

  const quickLinks = [
    { label: 'سجل المخالفات', icon: Table, to: '/violations', color: '#2668e5', bg: 'rgba(38,104,229,0.06)', border: 'rgba(38,104,229,0.15)' },
    { label: 'كشف المستخرجين', icon: Search, to: '/sheet/extractor', color: '#1d4ed8', bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.15)' },
    { label: 'كشف المدققين', icon: UserCheck, to: '/sheet/auditor', color: '#0369a1', bg: 'rgba(14,165,233,0.06)', border: 'rgba(14,165,233,0.15)' },
    { label: 'كشف المعدلين', icon: FileEdit, to: '/sheet/modifier', color: '#0f766e', bg: 'rgba(20,184,166,0.06)', border: 'rgba(20,184,166,0.15)' },
    { label: 'كشف المبلغين', icon: Radio, to: '/sheet/reporter', color: '#be123c', bg: 'rgba(244,63,94,0.06)', border: 'rgba(244,63,94,0.15)' },
    { label: 'التقارير', icon: BarChart3, to: '/reports', color: '#6d28d9', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.15)' },
  ];

  return (
    <div className="space-y-5">
      {/* رأس الصفحة */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold" style={{ background: 'rgba(38,104,229,0.08)', border: '1px solid rgba(38,104,229,0.12)', color: '#1d52d2' }}>
              <Building2 className="w-3.5 h-3.5" /><span>أمانة عمّان الكبرى</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', color: '#059669' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>جاهز للإدخال</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900">كشف تعديل مخالفات الكاميرات</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">إدخال وتدقيق بيانات تعديل مخالفات كاميرات الرقابة مع مقارنة بصرية ذكية للوحات الأردنية</p>
        </div>
        <button onClick={() => window.print()} type="button" className="no-print flex items-center gap-2 px-4 py-2.5 font-bold rounded-xl text-xs transition-all duration-200 hover:-translate-y-0.5" style={{ background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.2)', color: '#475569' }}>
          <Printer className="w-3.5 h-3.5" /><span>طباعة النموذج</span>
        </button>
      </div>

      {/* تنبيه إذا كانت قوائم الموظفين فارغة */}
      {extractors.length === 0 && (
        <div className="p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-bold animate-slide-down" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', color: '#1d4ed8' }}>
          <div className="flex items-center gap-2"><User className="w-5 h-5 flex-shrink-0" style={{ color: '#3b82f6' }} /><span>النظام جاهز ونظيف 100%! يرجى من مدير النظام التوجه أولاً إلى شاشة (إدارة الموظفين) لإضافة أرقام وأسماء الكادر الفعلي.</span></div>
          <button type="button" onClick={() => navigate('/admin/employees')} className="px-4 py-2 text-white rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg,#2668e5,#1d52d2)', boxShadow: '0 4px 12px rgba(38,104,229,0.3)' }}>إضافة كادر الموظفين الآن</button>
        </div>
      )}

      {/* تنبيهات النجاح أو الخطأ */}
      {alert.show && (
        <div className="p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-slide-down"
          style={alert.type === 'success' ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#065f46' } : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#991b1b' }}>
          {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#10b981' }} /> : <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#ef4444' }} />}
          <div className="flex-1">{alert.message}</div>
          <button onClick={() => setAlert({ show: false, type: '', message: '' })} className="p-1 rounded-lg hover:opacity-70 transition"><X className="w-4 h-4" /></button>
        </div>
      )}

      <form id="violation-entry-form" onSubmit={handleSubmit} className="space-y-4">
        {/* القسم 1: بيانات المخالفة والمركبة */}
        <div className="bg-white rounded-2xl p-6 space-y-5" style={{ border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <SectionHeader icon={Car} title="بيانات المخالفة والمركبة والكاميرا" />

          {/* اختيار الاختصاص */}
          <div className="p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div>
              <p className="text-xs font-black text-slate-800">اختصاص المخالفة <span className="text-rose-500">*</span></p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">حدد اختصاص المخالفة إن كانت سير أو دوريات خارجية</p>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#e2e8f0' }}>
              {[{ val: 'سير', label: 'سير العاصمة', emoji: '🚦', activeStyle: { background: 'linear-gradient(135deg,#2668e5,#1d52d2)', color: 'white', boxShadow: '0 2px 8px rgba(38,104,229,0.35)' } }, { val: 'دوريات خارجية', label: 'دوريات خارجية', emoji: '🚓', activeStyle: { background: 'linear-gradient(135deg,#d97706,#b45309)', color: 'white', boxShadow: '0 2px 8px rgba(217,119,6,0.35)' } }].map(j => (
                <button key={j.val} type="button" onClick={() => setFormData({ ...formData, jurisdiction: j.val })}
                  className="px-5 py-2 rounded-lg text-xs font-black transition-all duration-200 flex items-center gap-2"
                  style={formData.jurisdiction === j.val ? j.activeStyle : { background: 'transparent', color: '#64748b' }}>
                  <span>{j.emoji}</span><span>{j.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. رقم المخالفة */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">1. رقم المخالفة <span className="text-rose-500">*</span></label>
              <div className="relative">
                <input ref={violationInputRef} id="violation-number-input" type="text" required placeholder="مثال: GAM-2026-1050"
                  value={formData.violation_number} onChange={(e) => setFormData({ ...formData, violation_number: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-bold outline-none transition-all duration-200"
                  style={numberStatus.exists ? { background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.4)', color: '#991b1b', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : inputStyle}
                  onFocus={e => { if (!numberStatus.exists) inputFocus(e); }}
                  onBlur={e => { if (!numberStatus.exists) inputBlur(e); }}
                />
                {numberStatus.checking && <Loader2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 animate-spin" />}
              </div>
              {numberStatus.message && <p className={`text-[11px] mt-1.5 font-bold ${numberStatus.exists ? 'text-rose-600' : 'text-emerald-600'}`}>{numberStatus.message}</p>}
            </div>

            {/* 2. تاريخ المخالفة */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">2. تاريخ المخالفة <span className="text-rose-500">*</span></label>
              <input type="date" required value={formData.violation_date} onChange={(e) => setFormData({ ...formData, violation_date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all duration-200" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
            </div>

            {/* موقع الكاميرا */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide flex items-center gap-1"><MapPin className="w-3 h-3" /> موقع الكاميرا <span className="text-rose-500">*</span></label>
              {locations.length > 0 ? (
                <select value={formData.camera_location} onChange={(e) => handleLocationChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all duration-200" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}>
                  <option value="">-- اختر موقع الكاميرا --</option>
                  {locations.map((loc) => (<option key={loc.id} value={loc.name}>{loc.name} {loc.code ? `[${loc.code}]` : ''} ({loc.zone})</option>))}
                </select>
              ) : (
                <input type="text" placeholder="أدخل موقع الكاميرا..." value={formData.camera_location} onChange={(e) => handleLocationChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all duration-200" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              )}
            </div>

            {/* رمز موقع الكاميرا */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Camera className="w-3 h-3" /> رمز الموقع (الكود)</label>
              <input type="text" placeholder="مثال: CAM-01" value={formData.location_code || ''} onChange={(e) => setFormData({ ...formData, location_code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase outline-none transition-all duration-200" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
            </div>

            {/* 3. رقم المركبة الخطأ */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">3. رقم المركبة الخطأ (لوحة أردنية) <span className="text-rose-500">*</span></label>
              <input type="text" required placeholder="مثال: 50-98432 أو 10-12456" value={formData.wrong_vehicle_number} onChange={(e) => setFormData({ ...formData, wrong_vehicle_number: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-black outline-none transition-all duration-200" style={{ ...inputStyle, color: '#be123c' }} onFocus={inputFocus} onBlur={inputBlur} />
            </div>

            {/* 4. رقم المركبة الصحيح */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">4. رقم المركبة الصحيح (بعد التدقيق) <span className="text-rose-500">*</span></label>
              <input type="text" required placeholder="مثال: 50-98423 أو 10-12458" value={formData.correct_vehicle_number} onChange={(e) => setFormData({ ...formData, correct_vehicle_number: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-black outline-none transition-all duration-200" style={{ ...inputStyle, color: '#059669' }} onFocus={inputFocus} onBlur={inputBlur} />
            </div>

            {/* 5. طبيعة الخطأ */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">5. طبيعة الخطأ <span className="text-rose-500">*</span></label>
              <select required value={formData.error_type} onChange={(e) => setFormData({ ...formData, error_type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all duration-200" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}>
                <option value="">-- اختر طبيعة الخطأ من القائمة --</option>
                {COMMON_ERROR_TYPES.map((type) => (<option key={type} value={type}>{type}</option>))}
              </select>
              {formData.error_type === 'أخرى' && (
                <div className="mt-2 animate-slide-down">
                  <input type="text" required placeholder="اكتب وصف طبيعة الخطأ هنا..." value={formData.custom_error_type} onChange={(e) => setFormData({ ...formData, custom_error_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all duration-200" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              )}
            </div>

            {/* إرفاق صورة الكاميرا */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Camera className="w-3 h-3" /> صورة الكاميرا (اختياري)</label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer">
                  <div className="px-3 py-2.5 rounded-xl text-center text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5"
                    style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', color: '#64748b' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2668e5'; e.currentTarget.style.color = '#2668e5'; e.currentTarget.style.background = 'rgba(38,104,229,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#f8fafc'; }}>
                    {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{uploadingImage ? 'جاري الرفع...' : formData.image_url ? 'تغيير الصورة' : 'إرفاق صورة'}</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {formData.image_url && (
                  <button type="button" onClick={() => setPreviewZoom(true)} className="p-2.5 rounded-xl transition-all duration-200"
                    style={{ background: 'rgba(38,104,229,0.08)', border: '1px solid rgba(38,104,229,0.15)', color: '#2668e5' }} title="معاينة الصورة">
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
              {formData.image_url && <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1"><CheckCheck className="w-3 h-3" /> تم إرفاق الصورة</p>}
            </div>

            {/* إرفاق فيديو الكاميرا */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide flex items-center gap-1"><Video className="w-3 h-3" /> فيديو المخالفة (اختياري)</label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer">
                  <div className="px-3 py-2.5 rounded-xl text-center text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5"
                    style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', color: '#64748b' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#d97706'; e.currentTarget.style.background = 'rgba(245,158,11,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#f8fafc'; }}>
                    {uploadingVideo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{uploadingVideo ? 'جاري الرفع...' : formData.video_url ? 'تغيير الفيديو' : 'إرفاق فيديو'}</span>
                  </div>
                  <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleVideoUpload} className="hidden" />
                </label>
                {formData.video_url && (
                  <button type="button" onClick={() => setVideoModalOpen(true)} className="p-2.5 rounded-xl transition-all duration-200"
                    style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#d97706' }} title="تشغيل مقطع الفيديو">
                    <Play className="w-4 h-4" />
                  </button>
                )}
              </div>
              {formData.video_url && <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1"><CheckCheck className="w-3 h-3" /> تم إرفاق الفيديو</p>}
            </div>
          </div>

          {/* المقارن البصري الذكي */}
          {(formData.wrong_vehicle_number || formData.correct_vehicle_number) && (
            <div className="mt-2 animate-slide-down">
              <PlateDiffViewer wrongPlate={formData.wrong_vehicle_number} correctPlate={formData.correct_vehicle_number} errorType={formData.error_type} />
            </div>
          )}
        </div>

        {/* القسم 2: بيانات الموظفين */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <SectionHeader icon={User} title="فريق العمل والمسؤولون عن السجل">
            <button type="button" onClick={() => setPinShiftData(!pinShiftData)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
              style={pinShiftData ? { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#92400e' } : { background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}
              title="تثبيت طاقم العمل وموقع الكاميرا حتى لا تضطر لإعادة اختيارهم مع كل مخالفة">
              <Pin className={`w-3.5 h-3.5 ${pinShiftData ? 'text-amber-600 rotate-45' : 'text-slate-400'}`} />
              <span>{pinShiftData ? '📌 مثبت لطاقم الوردية الحالية' : 'تثبيت طاقم الوردية'}</span>
            </button>
          </SectionHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamRoles.map((role) => (
              <div key={role.key} className="p-4 rounded-2xl space-y-3" style={{ background: role.bg, border: `1px solid ${role.border}` }}>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg" style={{ background: role.bg, color: role.color, border: `1px solid ${role.border}` }}>{role.label}</span>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">{role.numLabel} <span className="text-rose-500">*</span></label>
                  <select required value={formData[`${role.key}_id`]} onChange={(e) => handleEmployeeChange(role.key, e.target.value, role.list)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all duration-200"
                    style={{ background: 'white', border: `1px solid ${role.border}`, color: '#0f172a' }}
                    onFocus={e => { e.target.style.borderColor = role.ring; e.target.style.boxShadow = `0 0 0 3px ${role.ring}22`; }}
                    onBlur={e => { e.target.style.borderColor = role.border; e.target.style.boxShadow = 'none'; }}>
                    <option value="">-- اختر الرقم --</option>
                    {role.list.map((emp) => (<option key={emp.id} value={emp.number}>{emp.number} - {emp.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 uppercase tracking-wide">{role.nameLabel} (تلقائي)</label>
                  <input type="text" readOnly placeholder="يظهر تلقائياً..." value={formData[`${role.key}_name`]}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-bold cursor-not-allowed"
                    style={{ background: 'rgba(255,255,255,0.6)', border: `1px solid ${role.border}`, color: role.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* القسم 3: تاريخ ويوم الإدخال والملاحظات */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <SectionHeader icon={Calendar} title="بيانات الإدخال والتوثيق" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">14. التاريخ (تاريخ الإدخال) <span className="text-rose-500">*</span></label>
              <input type="date" required value={formData.entry_date} onChange={handleEntryDateChange}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all duration-200" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">15. اليوم (محسوب تلقائياً)</label>
              <input type="text" readOnly value={formData.entry_day}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-black cursor-not-allowed"
                style={{ background: 'rgba(38,104,229,0.05)', border: '1px solid rgba(38,104,229,0.15)', color: '#1d52d2' }} />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">ملاحظات إضافية (اختياري)</label>
              <input type="text" placeholder="تفاصيل التدقيق أو سبب التعديل..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all duration-200" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>
        </div>

        {/* زر الترحيل الرئيسي */}
        <div className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="text-[11px] text-slate-500 font-medium">
            * الحقول الموسومة بعلامة (<span className="text-rose-500">*</span>) إلزامية.
            <span className="mr-3 text-slate-400">اختصار: <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 border border-slate-300 rounded-md">Ctrl+Enter</kbd></span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button type="button" onClick={() => { setFormData(initialFormState); setNumberStatus({ checking: false, exists: false, message: '' }); setAlert({ show: false, type: '', message: '' }); }}
              className="px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; }}>
              <RotateCcw className="w-4 h-4" /><span>تفريغ الحقول</span>
            </button>
            <button type="submit" id="submit-violation-btn" disabled={submitting || numberStatus.exists}
              className="flex-1 sm:flex-none px-8 py-3 font-extrabold rounded-xl text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#059669,#0d9488)', boxShadow: '0 6px 20px rgba(5,150,105,0.35)' }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{submitting ? 'جاري الترحيل...' : 'ترحيل المعلومات (حفظ المخالفة)'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* نافذة معاينة صورة الكاميرا */}
      {previewZoom && formData.image_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(12px)' }}>
          <div className="relative max-w-3xl w-full rounded-3xl p-4 animate-slide-up" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setPreviewZoom(false)} className="absolute left-4 top-4 p-2 rounded-xl transition-all duration-200" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-bold text-white mb-3 text-right flex items-center gap-2"><Camera className="w-4 h-4 text-brand-400" /> معاينة صورة كاميرا المخالفة (أمانة عمّان)</h4>
            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
              <img src={formData.image_url} alt="Camera Violation" className="max-h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* نافذة تشغيل فيديو المخالفة */}
      {videoModalOpen && formData.video_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(12px)' }}>
          <div className="relative max-w-3xl w-full rounded-3xl p-4 animate-slide-up" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setVideoModalOpen(false)} className="absolute left-4 top-4 p-2 rounded-xl transition-all duration-200" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-bold text-white mb-3 text-right flex items-center gap-2"><Video className="w-4 h-4 text-amber-400" /> معاينة فيديو كاميرا المخالفة (أمانة عمّان)</h4>
            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
              <video src={formData.video_url} controls autoPlay className="max-h-full max-w-full rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* شريط الأزرار السريعة */}
      <div className="no-print">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">أزرار الوصول السريع</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {quickLinks.map(({ label, icon: Icon, to, color, bg, border }) => (
            <button key={to} onClick={() => navigate(to)}
              className="flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-xs transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: bg, border: `1px solid ${border}`, color }}>
              <Icon className="w-4 h-4" /><span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
