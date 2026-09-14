import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import JordanianPlate from './JordanianPlate';
import PlateDiffViewer from './PlateDiffViewer';
import ConfirmModal from './ConfirmModal';
import { formatDisplayDate } from '../utils/dateHelpers';
import {
  X,
  Printer,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Camera,
  Video,
  Play,
  Upload,
  Film,
  MapPin,
  Calendar,
  UserCheck,
  Search,
  FileEdit,
  Radio,
  FileText,
  Save,
  ZoomIn
} from 'lucide-react';

const ERROR_TYPES = [
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

export default function ViolationDetailModal({
  isOpen,
  onClose,
  violation,
  onUpdateSuccess,
  onDeleteSuccess
}) {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState('view'); // 'view' | 'edit' | 'print'
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // موظفون ومواقع لتسهيل التعديل
  const [extractors, setExtractors] = useState([]);
  const [auditors, setAuditors] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [reporters, setReporters] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (violation) {
      setFormData({
        violation_number: violation.violation_number || '',
        violation_date: violation.violation_date || '',
        jurisdiction: violation.jurisdiction || 'سير',
        wrong_vehicle_number: violation.wrong_vehicle_number || '',
        correct_vehicle_number: violation.correct_vehicle_number || '',
        error_type: violation.error_type || '',
        camera_location: violation.camera_location || '',
        location_code: violation.location_code || '',
        extractor_id: violation.extractor_id || '',
        extractor_name: violation.extractor_name || '',
        auditor_id: violation.auditor_id || '',
        auditor_name: violation.auditor_name || '',
        modifier_id: violation.modifier_id || '',
        modifier_name: violation.modifier_name || '',
        reporter_id: violation.reporter_id || '',
        reporter_name: violation.reporter_name || '',
        image_url: violation.image_url || '',
        video_url: violation.video_url || '',
        notes: violation.notes || ''
      });
      setMode('view');
    }
  }, [violation]);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingVideo(true);
    const data = new FormData();
    data.append('video', file);

    try {
      const res = await api.post('/violations/upload-video', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData((prev) => ({ ...prev, video_url: res.data.videoUrl }));
      toast.success('تم رفع فيديو المخالفة بنجاح');
    } catch {
      toast.error('فشل رفع مقطع الفيديو');
    } finally {
      setUploadingVideo(false);
    }
  };

  useEffect(() => {
    if (mode === 'edit' && extractors.length === 0) {
      async function loadLists() {
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
      loadLists();
    }
  }, [mode]);

  if (!isOpen || !violation) return null;

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put(`/violations/${violation.id}`, formData);
      toast.success(res.data.message || 'تم تحديث بيانات المخالفة بنجاح');
      if (onUpdateSuccess) onUpdateSuccess(res.data.data);
      setMode('view');
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await api.delete(`/violations/${violation.id}`);
      toast.success(res.data.message || 'تم حذف المخالفة بنجاح');
      setDeleteConfirmOpen(false);
      onClose();
      if (onDeleteSuccess) onDeleteSuccess(violation.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل حذف المخالفة');
    } finally {
      setDeleting(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
        <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* شريط الأزرار والترويسة */}
          <div className="no-print p-4 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-50 text-brand-700 rounded-2xl border border-brand-100">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    مخالفة رقم: <span className="font-mono text-brand-700">{violation.violation_number}</span>
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {violation.error_type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  تاريخ المخالفة: {formatDisplayDate(violation.violation_date)} — الموقع: {violation.camera_location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {mode === 'view' ? (
                <>
                  <button
                    onClick={() => setMode('edit')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-brand-700 border border-slate-300 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>

                  <button
                    onClick={handlePrintSlip}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>طباعة الوصل</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setDeleteConfirmOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setMode('view')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition"
                >
                  إلغاء التعديل
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* محتوى النافذة القابل للتمرير */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* ترويسة الطباعة الورقية الفردية الرسمية (تظهر فقط عند الطباعة) */}
            <div className="print-only mb-6 border-b-2 border-slate-900 pb-4 text-center">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <h2 className="text-lg font-black">المملكة الأردنية الهاشمية</h2>
                  <h3 className="text-base font-extrabold text-slate-800">أمانة عمّان الكبرى</h3>
                  <p className="text-xs font-bold text-slate-600">مديرية الرقابة الآلية والتحكم — قسم المخالفات</p>
                </div>
                <div className="p-3 border-2 border-slate-800 rounded-2xl text-center">
                  <span className="block text-xs font-bold text-slate-500">رقم المخالفة</span>
                  <span className="font-mono text-xl font-black">{violation.violation_number}</span>
                </div>
              </div>
              <h1 className="text-base font-black text-center mt-3 pt-2 border-t border-slate-300">
                وصل تدقيق وتعديل مخالفة كاميرا رقابية
              </h1>
            </div>

            {mode === 'view' ? (
              /* وضع العرض الشامل */
              <div className="space-y-6">
                {/* المقارنة البصرية الذكية للوحات الأردنية */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 text-center">
                    المقارنة البصرية للوحة المركبة (الأردن)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs font-extrabold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                        اللوحة المسجلة بالخطأ
                      </span>
                      <JordanianPlate plateNumber={violation.wrong_vehicle_number} isError={true} />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                        اللوحة الصحيحة بعد التدقيق
                      </span>
                      <JordanianPlate plateNumber={violation.correct_vehicle_number} isError={false} />
                    </div>
                  </div>

                  {/* مقارنة الرموز والاختلافات */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <PlateDiffViewer
                      wrongPlate={violation.wrong_vehicle_number}
                      correctPlate={violation.correct_vehicle_number}
                    />
                  </div>
                </div>

                {/* تفاصيل المخالفة والكوادر المسؤولة */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* بيانات المخالفة */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <h5 className="text-xs font-black text-slate-800 border-b pb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-brand-600" />
                      <span>بيانات المخالفة والموقع</span>
                    </h5>
                    <div className="text-xs space-y-2">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-bold">رقم المخالفة:</span>
                        <span className="font-mono font-black text-slate-800">{violation.violation_number}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-bold">اختصاص المخالفة:</span>
                        <span
                          className={`font-black px-2.5 py-0.5 rounded-full text-[11px] border ${
                            violation.jurisdiction === 'دوريات خارجية'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          {violation.jurisdiction === 'دوريات خارجية' ? '🚓 دوريات خارجية' : '🚦 سير العاصمة'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-bold">تاريخ المخالفة:</span>
                        <span className="font-bold text-slate-800">{violation.violation_date}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-bold">موقع الكاميرا ورمزها:</span>
                        <span className="font-bold text-slate-800">
                          {violation.camera_location} {violation.location_code ? `[${violation.location_code}]` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-bold">طبيعة الخطأ:</span>
                        <span className="font-bold text-brand-700">{violation.error_type}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 font-bold">تاريخ ويوم الإدخال:</span>
                        <span className="font-bold text-slate-800">{violation.entry_day} — {violation.entry_date}</span>
                      </div>
                    </div>
                  </div>

                  {/* طاقم الوردية المسؤول */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <h5 className="text-xs font-black text-slate-800 border-b pb-2 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-brand-600" />
                      <span>طاقم العمل والمسؤولية الإدارية</span>
                    </h5>
                    <div className="text-xs space-y-2">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-bold">المستخرج:</span>
                        <span className="font-bold text-slate-800">
                          {violation.extractor_name} ({violation.extractor_id})
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-bold">المدقق:</span>
                        <span className="font-bold text-slate-800">
                          {violation.auditor_name} ({violation.auditor_id})
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-bold">المعدل:</span>
                        <span className="font-bold text-slate-800">
                          {violation.modifier_name} ({violation.modifier_id})
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 font-bold">المبلغ:</span>
                        <span className="font-bold text-slate-800">
                          {violation.reporter_name} ({violation.reporter_id})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ملاحظات وصورة الكاميرا */}
                {violation.notes && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 font-bold">
                    <span className="text-amber-700 ml-1">ملاحظات إضافية:</span>
                    {violation.notes}
                  </div>
                )}

                {/* صورة الكاميرا */}
                {violation.image_url && (
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-brand-600" />
                        <span>لقطة الكاميرا الرقابية</span>
                      </h5>
                      <button
                        type="button"
                        onClick={() => setImageZoom(!imageZoom)}
                        className="no-print flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>{imageZoom ? 'تصغير الصورة' : 'تكبير الصورة'}</span>
                      </button>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 flex items-center justify-center">
                      <img
                        src={violation.image_url}
                        alt="صورة الكاميرا"
                        className={`transition-all duration-300 ${
                          imageZoom ? 'max-h-[600px] w-full object-contain' : 'max-h-72 object-cover'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* فيديو الكاميرا */}
                {violation.video_url && (
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-amber-500" />
                        <span>تسجيل فيديو كاميرا المخالفة</span>
                      </h5>
                      <a
                        href={violation.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="no-print text-xs font-bold text-brand-700 hover:underline"
                      >
                        فتح / تنزيل الفيديو
                      </a>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-black flex items-center justify-center max-h-80">
                      <video src={violation.video_url} controls className="max-h-80 w-full object-contain" />
                    </div>
                  </div>
                )}

                {/* مربعات التواقيع الرسمية للطباعة الورقية فقط */}
                <div className="print-only pt-8 grid grid-cols-4 gap-4 text-center border-t border-slate-400 mt-6">
                  <div className="border border-slate-400 p-3 rounded-lg">
                    <p className="font-bold text-xs mb-8">توقيع المستخرج</p>
                    <p className="text-[10px] text-slate-600">{violation.extractor_name}</p>
                  </div>
                  <div className="border border-slate-400 p-3 rounded-lg">
                    <p className="font-bold text-xs mb-8">توقيع المدقق</p>
                    <p className="text-[10px] text-slate-600">{violation.auditor_name}</p>
                  </div>
                  <div className="border border-slate-400 p-3 rounded-lg">
                    <p className="font-bold text-xs mb-8">توقيع المعدل</p>
                    <p className="text-[10px] text-slate-600">{violation.modifier_name}</p>
                  </div>
                  <div className="border border-slate-400 p-3 rounded-lg">
                    <p className="font-bold text-xs mb-8">اعتماد مدير القسم</p>
                    <p className="text-[10px] text-slate-600">أمانة عمّان الكبرى</p>
                  </div>
                </div>
              </div>
            ) : (
              /* وضع التعديل (Edit Mode) */
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم المخالفة
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.violation_number}
                      onChange={(e) => setFormData({ ...formData, violation_number: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold font-mono focus:bg-white focus:border-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اختصاص المخالفة
                    </label>
                    <select
                      value={formData.jurisdiction || 'سير'}
                      onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:border-brand-500 outline-none"
                    >
                      <option value="سير">🚦 سير العاصمة</option>
                      <option value="دوريات خارجية">🚓 دوريات خارجية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      تاريخ المخالفة
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.violation_date}
                      onChange={(e) => setFormData({ ...formData, violation_date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:border-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-red-700 mb-1">
                      المركبة الخطأ
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.wrong_vehicle_number}
                      onChange={(e) => setFormData({ ...formData, wrong_vehicle_number: e.target.value })}
                      className="w-full px-3 py-2 bg-red-50/50 border border-red-300 rounded-xl text-xs font-bold font-mono focus:bg-white focus:border-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-800 mb-1">
                      المركبة الصحيحة
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.correct_vehicle_number}
                      onChange={(e) => setFormData({ ...formData, correct_vehicle_number: e.target.value })}
                      className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl text-xs font-bold font-mono focus:bg-white focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      طبيعة الخطأ
                    </label>
                    <select
                      value={formData.error_type}
                      onChange={(e) => setFormData({ ...formData, error_type: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:border-brand-500 outline-none"
                    >
                      {ERROR_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      موقع الكاميرا
                    </label>
                    <select
                      value={formData.camera_location}
                      onChange={(e) => {
                        const locName = e.target.value;
                        const found = locations.find((l) => l.name === locName);
                        setFormData({
                          ...formData,
                          camera_location: locName,
                          location_code: (found && found.code) ? found.code : formData.location_code
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:border-brand-500 outline-none"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name} {loc.code ? `[${loc.code}]` : ''}
                        </option>
                      ))}
                      {!locations.find((l) => l.name === formData.camera_location) && (
                        <option value={formData.camera_location}>{formData.camera_location}</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رمز الموقع (الكود)
                    </label>
                    <input
                      type="text"
                      value={formData.location_code || ''}
                      onChange={(e) => setFormData({ ...formData, location_code: e.target.value.toUpperCase() })}
                      placeholder="مثال: CAM-01"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase focus:bg-white focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                {/* خيارات فيديو وصورة المخالفة في التعديل */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-amber-500" />
                    <span>فيديو المخالفة (اختياري)</span>
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="px-3 py-2 bg-white border border-dashed border-slate-300 hover:border-brand-500 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-brand-600" />
                      <span>{uploadingVideo ? 'جاري الرفع...' : formData.video_url ? 'تغيير الفيديو' : 'إرفاق فيديو'}</span>
                      <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleVideoUpload} className="hidden" />
                    </label>
                    {formData.video_url && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, video_url: '' })}
                        className="px-2.5 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold border border-red-200"
                      >
                        إزالة الفيديو
                      </button>
                    )}
                    {formData.video_url && (
                      <span className="text-[11px] text-emerald-700 font-bold">✓ يوجد فيديو مرفق</span>
                    )}
                  </div>
                </div>

                {/* اختيار الموظفين */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">المستخرج</label>
                    <select
                      value={formData.extractor_id}
                      onChange={(e) => {
                        const sel = extractors.find((x) => String(x.number) === e.target.value);
                        setFormData({
                          ...formData,
                          extractor_id: e.target.value,
                          extractor_name: sel ? sel.name : formData.extractor_name
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      {extractors.map((e) => (
                        <option key={e.id} value={e.number}>
                          {e.number} - {e.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">المدقق</label>
                    <select
                      value={formData.auditor_id}
                      onChange={(e) => {
                        const sel = auditors.find((x) => String(x.number) === e.target.value);
                        setFormData({
                          ...formData,
                          auditor_id: e.target.value,
                          auditor_name: sel ? sel.name : formData.auditor_name
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      {auditors.map((e) => (
                        <option key={e.id} value={e.number}>
                          {e.number} - {e.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">المعدل</label>
                    <select
                      value={formData.modifier_id}
                      onChange={(e) => {
                        const sel = modifiers.find((x) => String(x.number) === e.target.value);
                        setFormData({
                          ...formData,
                          modifier_id: e.target.value,
                          modifier_name: sel ? sel.name : formData.modifier_name
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      {modifiers.map((e) => (
                        <option key={e.id} value={e.number}>
                          {e.number} - {e.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">المبلغ</label>
                    <select
                      value={formData.reporter_id}
                      onChange={(e) => {
                        const sel = reporters.find((x) => String(x.number) === e.target.value);
                        setFormData({
                          ...formData,
                          reporter_id: e.target.value,
                          reporter_name: sel ? sel.name : formData.reporter_name
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      {reporters.map((e) => (
                        <option key={e.id} value={e.number}>
                          {e.number} - {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الملاحظات
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:border-brand-500 outline-none"
                    placeholder="ملاحظات توثيقية إضافية..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setMode('view')}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* نافذة تأكيد الحذف للمدير */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="تأكيد حذف المخالفة"
        message={`هل أنت متأكد من رغبتك بحذف المخالفة رقم (${violation.violation_number})؟ هذا الإجراء لا يمكن التراجع عنه وسيسجل في سجل الرقابة.`}
        confirmText={deleting ? 'جاري الحذف...' : 'نعم، احذف المخالفة'}
        danger={true}
      />
    </>
  );
}
