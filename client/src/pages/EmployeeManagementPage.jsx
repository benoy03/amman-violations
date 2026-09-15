import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import ConfirmModal from '../components/ConfirmModal';
import BulkEmployeeModal from '../components/BulkEmployeeModal';
import EditEmployeeModal from '../components/EditEmployeeModal';
import { useToast } from '../context/ToastContext';
import {
  Users,
  UserPlus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Search,
  UserCheck,
  FileEdit,
  Radio,
  MapPin,
  Plus,
  FileSpreadsheet,
  Edit3,
  Key,
  Lock,
  UserX,
  Shield,
  Sparkles,
  Check,
  X,
  Loader2,
  Layers,
  Database
} from 'lucide-react';

const TABS = [
  { id: 'extractors', label: 'المستخرجون', singular: 'مستخرج', icon: Search, type: 'employee', color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.2)', grad: 'linear-gradient(135deg, #1d4ed8, #2563eb)' },
  { id: 'auditors', label: 'المدققون', singular: 'مدقق', icon: UserCheck, type: 'employee', color: '#0284c7', bg: 'rgba(2,132,199,0.08)', border: 'rgba(2,132,199,0.2)', grad: 'linear-gradient(135deg, #0369a1, #0284c7)' },
  { id: 'modifiers', label: 'المعدلون', singular: 'معدل', icon: FileEdit, type: 'employee', color: '#0d9488', bg: 'rgba(13,148,136,0.08)', border: 'rgba(13,148,136,0.2)', grad: 'linear-gradient(135deg, #0f766e, #0d9488)' },
  { id: 'reporters', label: 'المبلغون', singular: 'مبلغ', icon: Radio, type: 'employee', color: '#e11d48', bg: 'rgba(225,29,72,0.08)', border: 'rgba(225,29,72,0.2)', grad: 'linear-gradient(135deg, #be123c, #e11d48)' },
  { id: 'locations', label: 'مواقع الكاميرات', singular: 'موقع كاميرا', icon: MapPin, type: 'location', color: '#d97706', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.2)', grad: 'linear-gradient(135deg, #b45309, #d97706)' },
  { id: 'users', label: 'المستخدمون والصلاحيات', singular: 'مستخدم', icon: ShieldCheck, type: 'user', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)', grad: 'linear-gradient(135deg, #6d28d9, #7c3aed)' }
];

export default function EmployeeManagementPage() {
  const [activeTab, setActiveTab] = useState('extractors');
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // حقول إضافة موظف
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');

  // حقول إضافة موقع كاميرا
  const [locationCode, setLocationCode] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationZone, setLocationZone] = useState('');

  // حقول إضافة مستخدم جديد
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [userRole, setUserRole] = useState('user');

  // مودال تغيير كلمة المرور لأي مستخدم
  const [resetPassModal, setResetPassModal] = useState({
    isOpen: false,
    user: null,
    newPassword: '',
    loading: false
  });

  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const [editModal, setEditModal] = useState({
    isOpen: false,
    item: null,
    isLocation: false
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null,
    isLocation: false,
    violationsCount: 0,
    loading: false
  });

  const currentTabObj = TABS.find((t) => t.id === activeTab) || TABS[0];

  const fetchData = async () => {
    setLoading(true);
    try {
      if (currentTabObj.type === 'location') {
        const res = await api.get('/locations');
        setLocations(res.data.data || []);
      } else if (currentTabObj.type === 'user') {
        const res = await api.get('/auth/users');
        setUsers(res.data.data || []);
      } else {
        const res = await api.get(`/employees/${activeTab}/all-stats`);
        setEmployees(res.data.data || []);
      }
    } catch (err) {
      console.error('فشل جلب البيانات:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // إضافة موظف
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!number.trim() || !name.trim()) return;

    setAdding(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      const res = await api.post(`/employees/${activeTab}`, {
        number: number.trim(),
        name: name.trim()
      });

      setAlert({
        show: true,
        type: 'success',
        message: res.data.message || 'تمت إضافة الموظف بنجاح'
      });
      toast.success(res.data.message || 'تمت إضافة الموظف بنجاح');
      setNumber('');
      setName('');
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء إضافة الموظف';
      setAlert({ show: true, type: 'error', message: msg });
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  // إضافة موقع كاميرا
  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!locationName.trim()) return;

    setAdding(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      const res = await api.post('/locations', {
        code: locationCode.trim().toUpperCase() || null,
        name: locationName.trim(),
        zone: locationZone.trim() || 'عمّان'
      });

      setAlert({
        show: true,
        type: 'success',
        message: 'تمت إضافة موقع الكاميرا بنجاح'
      });
      toast.success('تمت إضافة موقع الكاميرا بنجاح');
      setLocationCode('');
      setLocationName('');
      setLocationZone('');
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء إضافة موقع الكاميرا';
      setAlert({ show: true, type: 'error', message: msg });
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  // إضافة مستخدم جديد للنظام مع كلمة مرور
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!userUsername.trim() || !userPassword.trim() || !userFullName.trim()) {
      toast.error('يرجى تعبئة كافة الحقول المطلوبة');
      return;
    }

    setAdding(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      const res = await api.post('/auth/users', {
        username: userUsername.trim().toLowerCase(),
        password: userPassword,
        full_name: userFullName.trim(),
        role: userRole
      });

      toast.success(res.data.message || 'تم إنشاء حساب المستخدم بنجاح');
      setAlert({ show: true, type: 'success', message: res.data.message });
      setUserUsername('');
      setUserPassword('');
      setUserFullName('');
      setUserRole('user');
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل إنشاء المستخدم';
      toast.error(msg);
      setAlert({ show: true, type: 'error', message: msg });
    } finally {
      setAdding(false);
    }
  };

  // تغيير كلمة مرور مستخدم
  const handleAdminResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPassModal.user || !resetPassModal.newPassword) return;

    setResetPassModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await api.put(`/auth/users/${resetPassModal.user.id}/password`, {
        newPassword: resetPassModal.newPassword
      });
      toast.success(res.data.message || 'تم تغيير كلمة المرور بنجاح');
      setResetPassModal({ isOpen: false, user: null, newPassword: '', loading: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل تغيير كلمة المرور');
      setResetPassModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // حذف مستخدم
  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`هل أنت متأكد من حذف حساب المستخدم [${targetUser.username} - ${targetUser.full_name}]؟`)) {
      return;
    }

    try {
      const res = await api.delete(`/auth/users/${targetUser.id}`);
      toast.success(res.data.message || 'تم حذف حساب المستخدم بنجاح');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل حذف المستخدم');
    }
  };

  const openDeleteConfirmation = async (emp) => {
    try {
      const res = await api.get(`/employees/${activeTab}/check/${encodeURIComponent(emp.number)}`);
      setDeleteModal({
        isOpen: true,
        item: emp,
        isLocation: false,
        violationsCount: res.data.violationsCount || 0,
        loading: false
      });
    } catch {
      setDeleteModal({
        isOpen: true,
        item: emp,
        isLocation: false,
        violationsCount: emp.violations_count || 0,
        loading: false
      });
    }
  };

  const openLocationDeleteConfirmation = (loc) => {
    setDeleteModal({
      isOpen: true,
      item: loc,
      isLocation: true,
      violationsCount: 0,
      loading: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.item) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      if (deleteModal.isLocation) {
        await api.delete(`/locations/${deleteModal.item.id}`);
        toast.success(`تم حذف موقع الكاميرا (${deleteModal.item.name}) بنجاح`);
      } else {
        await api.delete(`/employees/${activeTab}/${encodeURIComponent(deleteModal.item.number)}`);
        toast.success(`تم إلغاء تفعيل ${currentTabObj.singular} (${deleteModal.item.name}) بنجاح`);
      }
      setDeleteModal({ isOpen: false, item: null, isLocation: false, violationsCount: 0, loading: false });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الحذف');
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const inputStyle = {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#0f172a'
  };

  const inputFocus = (e) => {
    e.target.style.borderColor = currentTabObj.color;
    e.target.style.boxShadow = `0 0 0 3px ${currentTabObj.color}20`;
    e.target.style.background = '#ffffff';
  };

  const inputBlur = (e) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.boxShadow = 'none';
    e.target.style.background = '#f8fafc';
  };

  const currentCount = currentTabObj.type === 'location'
    ? locations.length
    : currentTabObj.type === 'user'
    ? users.length
    : employees.length;

  return (
    <div className="space-y-6">
      {/* ترويسة الصفحة الاحترافية */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black text-brand-700 bg-brand-50/80 border border-brand-200/60 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>إعدادات النظام والبيانات الأساسية</span>
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-xl border border-slate-200/60 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentCount} عنصر مسجل</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            إدارة الكوادر ومواقع الكاميرات
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            إدارة أرقام وأسماء كادر العمل ومواقع الكاميرات في أمانة عمّان لتغذية شاشات الإدخال وشيتات التدقيق
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setBulkModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-black hover:to-slate-950 text-white text-xs font-black shadow-lg shadow-slate-900/20 hover:shadow-xl transition border border-slate-700 w-full md:w-auto transform active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>لصق واستيراد سريع (Excel Bulk)</span>
          </button>
        </div>
      </div>

      {/* التنبيهات المدمجة */}
      {alert.show && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold animate-in fade-in duration-200 ${
            alert.type === 'success'
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-800 shadow-sm'
              : 'bg-rose-50/90 border-rose-300 text-rose-800 shadow-sm'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <div className="flex-1">{alert.message}</div>
          <button
            onClick={() => setAlert({ show: false, type: '', message: '' })}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* شريط التبويبات الفاخر */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70 flex gap-1.5 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setAlert({ show: false, type: '', message: '' });
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              style={
                isActive
                  ? {
                      border: `1px solid ${tab.border}`,
                      color: tab.color,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }
                  : {}
              }
            >
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  background: isActive ? tab.bg : 'transparent',
                  color: isActive ? tab.color : 'inherit'
                }}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* محتوى التبويب المختار */}
      {currentTabObj.type === 'location' ? (
        /* تبويب مواقع الكاميرات */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* بطاقة إضافة موقع كاميرا */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 h-fit">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: currentTabObj.bg, color: currentTabObj.color }}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">إضافة موقع كاميرا</h3>
                  <span className="text-[11px] font-semibold text-slate-400">شوارع وتقاطعات عمّان</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBulkModalOpen(true)}
                className="text-[11px] font-black flex items-center gap-1 px-2.5 py-1 rounded-lg transition"
                style={{ background: currentTabObj.bg, color: currentTabObj.color }}
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>لصق Excel</span>
              </button>
            </div>

            <form onSubmit={handleAddLocation} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">
                  رمز الموقع الفريد (الكود)
                </label>
                <input
                  type="text"
                  placeholder="مثال: CAM-01"
                  value={locationCode}
                  onChange={(e) => setLocationCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">
                  اسم موقع الكاميرا (الشارع / التقاطع) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شارع الأردن - دوار الاستقلال"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">
                  المنطقة (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: شمال عمّان أو وسط البلد"
                  value={locationZone}
                  onChange={(e) => setLocationZone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full py-3 text-white font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2 transform active:scale-95"
                style={{ background: currentTabObj.grad, boxShadow: `0 4px 12px ${currentTabObj.color}40` }}
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{adding ? 'جاري الإضافة...' : 'حفظ موقع الكاميرا'}</span>
              </button>
            </form>
          </div>

          {/* جدول مواقع الكاميرات */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: currentTabObj.bg, color: currentTabObj.color }}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">مواقع الكاميرات المعتمدة</h3>
                  <span className="text-[11px] font-semibold text-slate-400">كافة نقاط الرقابة المسجلة في العاصمة</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>الإجمالي: {locations.length} موقع</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200/80">
                    <th className="p-3">رمز الموقع</th>
                    <th className="p-3">اسم الموقع (الشارع / التقاطع)</th>
                    <th className="p-3">المنطقة</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-10 text-slate-400 font-bold">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                          <span>جاري تحميل المواقع...</span>
                        </div>
                      </td>
                    </tr>
                  ) : locations.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-10 text-slate-400 font-bold">
                        لا توجد مواقع كاميرات مسجلة حالياً. أضف أول موقع من النموذج الجانبي.
                      </td>
                    </tr>
                  ) : (
                    locations.map((loc) => (
                      <tr key={loc.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3">
                          <span className="font-mono font-black text-xs px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg">
                            {loc.code || '-'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-800">{loc.name}</td>
                        <td className="p-3 text-slate-600 font-medium">{loc.zone}</td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setEditModal({ isOpen: true, item: loc, isLocation: true })}
                              className="p-2 text-brand-600 hover:bg-brand-50 rounded-xl transition border border-transparent hover:border-brand-200"
                              title="تعديل موقع الكاميرا"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openLocationDeleteConfirmation(loc)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200"
                              title="حذف الموقع"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : currentTabObj.type === 'user' ? (
        /* تبويب المستخدمين والصلاحيات */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* بطاقة إضافة مستخدم جديد */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 h-fit">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: currentTabObj.bg, color: currentTabObj.color }}
                >
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">إنشاء حساب جديد</h3>
                  <span className="text-[11px] font-semibold text-slate-400">صلاحيات الدخول للنظام</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">
                  اسم المستخدم للدخول (Username) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ahmad_aml"
                  value={userUsername}
                  onChange={(e) => setUserUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">
                  الاسم الكامل للموظف <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="الاسم الثلاثي أو الرباعي"
                  value={userFullName}
                  onChange={(e) => setUserFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">
                  كلمة المرور الأولية <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="لا تقل عن 6 خانات"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">
                  نوع الصلاحية
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                >
                  <option value="user">موظف إدخال وتدقيق (User)</option>
                  <option value="admin">مدير نظام كامل الصلاحيات (Admin)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full py-3 text-white font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2 transform active:scale-95"
                style={{ background: currentTabObj.grad, boxShadow: `0 4px 12px ${currentTabObj.color}40` }}
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>{adding ? 'جاري الإنشاء...' : 'إنشاء حساب المستخدم'}</span>
              </button>
            </form>
          </div>

          {/* جدول المستخدمين */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: currentTabObj.bg, color: currentTabObj.color }}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">حسابات مستخدمي النظام</h3>
                  <span className="text-[11px] font-semibold text-slate-400">إدارة كلمات المرور ومستويات الوصول</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>الإجمالي: {users.length} مستخدم</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200/80">
                    <th className="p-3">اسم المستخدم</th>
                    <th className="p-3">الاسم الكامل</th>
                    <th className="p-3">الصلاحية</th>
                    <th className="p-3 text-center">الحالة</th>
                    <th className="p-3 text-center">كلمة المرور</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400 font-bold">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                          <span>جاري تحميل المستخدمين...</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400 font-bold">
                        لا يوجد مستخدمون مسجلون
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-mono font-bold text-purple-900">{u.username}</td>
                        <td className="p-3 font-bold text-slate-800">{u.full_name}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                              u.role === 'admin'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {u.role === 'admin' ? 'مدير نظام' : 'موظف'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[11px] font-black inline-flex items-center gap-1 ${u.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <span>{u.is_active ? 'نشط' : 'معطل'}</span>
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setResetPassModal({ isOpen: true, user: u, newPassword: '', loading: false })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl font-bold border border-amber-200/80 transition shadow-sm text-[11px]"
                            title="تغيير كلمة المرور"
                          >
                            <Key className="w-3.5 h-3.5 text-amber-600" />
                            <span>تغيير كلمة السر</span>
                          </button>
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200"
                            title="حذف الحساب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* تبويبات الموظفين (مستخرجين، مدققين، معدلين، مبلغين) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* بطاقة إضافة موظف جديد */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 h-fit">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: currentTabObj.bg, color: currentTabObj.color }}
                >
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">إضافة {currentTabObj.singular} جديد</h3>
                  <span className="text-[11px] font-semibold text-slate-400">إدراج بسجلات أمانة عمّان</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBulkModalOpen(true)}
                className="text-[11px] font-black flex items-center gap-1 px-2.5 py-1 rounded-lg transition"
                style={{ background: currentTabObj.bg, color: currentTabObj.color }}
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>لصق متعدد</span>
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">
                  رقم الموظف في الأمانة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 101 أو 5542"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">
                  اسم الموظف الفعلي بالكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="أدخل الاسم الحقيقي للموظف..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full py-3 text-white font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2 transform active:scale-95"
                style={{ background: currentTabObj.grad, boxShadow: `0 4px 12px ${currentTabObj.color}40` }}
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>{adding ? 'جاري الإضافة...' : `إضافة إلى قائمة ${currentTabObj.label}`}</span>
              </button>
            </form>
          </div>

          {/* جدول الموظفين */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: currentTabObj.bg, color: currentTabObj.color }}
                >
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">قائمة {currentTabObj.label}</h3>
                  <span className="text-[11px] font-semibold text-slate-400">الكوادر المفعلة في النظام</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTabObj.color }} />
                <span>الإجمالي: {employees.length}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200/80">
                    <th className="p-3">الرقم الوظيفي</th>
                    <th className="p-3">الاسم الكامل</th>
                    <th className="p-3 text-center">المخالفات المرتبطة</th>
                    <th className="p-3 text-center">الحالة</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-slate-400 font-bold">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" style={{ color: currentTabObj.color }} />
                          <span>جاري تحميل البيانات...</span>
                        </div>
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-slate-400 font-bold">
                        لا يوجد موظفون مضافون حالياً. استخدم النموذج لإضافة أول {currentTabObj.singular}.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr
                        key={emp.id}
                        className={`hover:bg-slate-50/80 transition ${
                          emp.is_active === 0 ? 'opacity-50 bg-slate-100/50' : ''
                        }`}
                      >
                        <td className="p-3 font-mono font-black text-slate-900">{emp.number}</td>
                        <td className="p-3 font-bold text-slate-800">{emp.name}</td>
                        <td className="p-3 text-center font-black">
                          {emp.violations_count > 0 ? (
                            <span
                              className="px-2.5 py-1 rounded-lg text-xs font-black border"
                              style={{ background: currentTabObj.bg, borderColor: currentTabObj.border, color: currentTabObj.color }}
                            >
                              {emp.violations_count} مخالفة
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">لا توجد</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {emp.is_active === 1 ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 font-black text-[11px] inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>نشط</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded-lg font-bold text-[11px]">
                              معطل
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setEditModal({ isOpen: true, item: emp, isLocation: false })}
                              className="p-2 text-brand-600 hover:bg-brand-50 rounded-xl transition border border-transparent hover:border-brand-200"
                              title="تعديل بيانات الموظف"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {emp.is_active === 1 && (
                              <button
                                onClick={() => openDeleteConfirmation(emp)}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200"
                                title="إلغاء التفعيل / حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تأكيد الحذف */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.isLocation ? 'تأكيد حذف موقع الكاميرا' : `تأكيد حذف ${currentTabObj.singular}`}
        message={
          deleteModal.isLocation
            ? `هل أنت متأكد من حذف موقع الكاميرا (${deleteModal.item?.name})؟`
            : `هل أنت متأكد من رغبتك في حذف الموظف (${deleteModal.item?.name}) رقم (${deleteModal.item?.number})؟`
        }
        warningMessage={
          deleteModal.violationsCount > 0
            ? `تنبيه هام: هذا الموظف مرتبط بـ (${deleteModal.violationsCount}) مخالفة مسجلة! سيتم تطبيق الحذف الآمن (Soft Delete) للاحتفاظ بسجلاته التاريخية وإخفائه فقط من قوائم الإدخال الجديدة.`
            : null
        }
        confirmLabel="تأكيد الحذف"
        cancelLabel="تراجع"
        isLoading={deleteModal.loading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, item: null, isLocation: false, violationsCount: 0, loading: false })}
      />

      {/* نافذة اللصق السريع المتعدد (Bulk Import) */}
      <BulkEmployeeModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        activeTab={activeTab}
        onRefresh={fetchData}
      />

      {/* نافذة تعديل بيانات الموظف أو الموقع */}
      <EditEmployeeModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, item: null, isLocation: false })}
        item={editModal.item}
        isLocation={editModal.isLocation}
        role={activeTab}
        onSuccess={fetchData}
      />

      {/* نافذة تغيير كلمة المرور للمستخدمين من قِبل المدير */}
      {resetPassModal.isOpen && resetPassModal.user && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">تغيير كلمة المرور</h3>
              </div>
              <button
                onClick={() => setResetPassModal({ isOpen: false, user: null, newPassword: '', loading: false })}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-medium">
              تغيير كلمة سر حساب: <span className="font-bold text-slate-800">{resetPassModal.user.username}</span> ({resetPassModal.user.full_name})
            </p>

            <form onSubmit={handleAdminResetPassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">
                  كلمة المرور الجديدة (6 خانات على الأقل) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="أدخل كلمة المرور الجديدة"
                  value={resetPassModal.newPassword}
                  onChange={(e) => setResetPassModal((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPassModal({ isOpen: false, user: null, newPassword: '', loading: false })}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={resetPassModal.loading || resetPassModal.newPassword.length < 6}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-black text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {resetPassModal.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                  <span>{resetPassModal.loading ? 'جاري التحديث...' : 'حفظ كلمة المرور'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
