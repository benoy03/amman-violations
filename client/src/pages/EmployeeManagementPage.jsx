import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import ConfirmModal from '../components/ConfirmModal';
import BulkEmployeeModal from '../components/BulkEmployeeModal';
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
  FileSpreadsheet
} from 'lucide-react';

const TABS = [
  { id: 'extractors', label: 'المستخرجون', singular: 'مستخرج', icon: Search, type: 'employee' },
  { id: 'auditors', label: 'المدققون', singular: 'مدقق', icon: UserCheck, type: 'employee' },
  { id: 'modifiers', label: 'المعدلون', singular: 'معدل', icon: FileEdit, type: 'employee' },
  { id: 'reporters', label: 'المبلغون', singular: 'مبلغ', icon: Radio, type: 'employee' },
  { id: 'locations', label: 'مواقع الكاميرات', singular: 'موقع كاميرا', icon: MapPin, type: 'location' }
];

export default function EmployeeManagementPage() {
  const [activeTab, setActiveTab] = useState('extractors');
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // حقول إضافة موظف
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');

  // حقول إضافة موقع كاميرا
  const [locationName, setLocationName] = useState('');
  const [locationZone, setLocationZone] = useState('');

  const [adding, setAdding] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

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
      setNumber('');
      setName('');
      fetchData();
    } catch (err) {
      setAlert({
        show: true,
        type: 'error',
        message: err.response?.data?.message || 'حدث خطأ أثناء إضافة الموظف'
      });
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
        name: locationName.trim(),
        zone: locationZone.trim() || 'عمّان'
      });

      setAlert({
        show: true,
        type: 'success',
        message: 'تمت إضافة موقع الكاميرا بنجاح'
      });
      setLocationName('');
      setLocationZone('');
      fetchData();
    } catch (err) {
      setAlert({
        show: true,
        type: 'error',
        message: err.response?.data?.message || 'حدث خطأ أثناء إضافة موقع الكاميرا'
      });
    } finally {
      setAdding(false);
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
        setAlert({
          show: true,
          type: 'success',
          message: `تم حذف موقع الكاميرا (${deleteModal.item.name}) بنجاح`
        });
      } else {
        await api.delete(`/employees/${activeTab}/${encodeURIComponent(deleteModal.item.number)}`);
        setAlert({
          show: true,
          type: 'success',
          message: `تم إلغاء تفعيل ${currentTabObj.singular} (${deleteModal.item.name}) بنجاح`
        });
      }
      setDeleteModal({ isOpen: false, item: null, isLocation: false, violationsCount: 0, loading: false });
      fetchData();
    } catch (err) {
      setAlert({
        show: true,
        type: 'error',
        message: err.response?.data?.message || 'فشل الحذف'
      });
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* الرأس وعنوان الصفحة */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100 flex items-center gap-1 w-max">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>إعدادات النظام والبيانات الأساسية</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            إدارة بيانات الموظفين ومواقع الكاميرات
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            أدخل أرقام وأسماء كادر العمل ومواقع الكاميرات الفعلية في أمانة عمّان لتظهر في القوائم المنسدلة وشاشة الإدخال
          </p>
        </div>

        <button
          type="button"
          onClick={() => setBulkModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-black hover:to-slate-950 text-white text-xs font-black shadow-lg shadow-slate-900/20 hover:shadow-xl transition border border-slate-700 w-full md:w-auto transform active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>لصق واستيراد سريع من Excel (Bulk Import)</span>
        </button>
      </div>

      {/* التنبيهات */}
      {alert.show && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold animate-in fade-in duration-200 ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
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
            className="underline hover:opacity-80"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* التبويبات الخمسة */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
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
              className={`flex items-center gap-2 px-5 py-3.5 font-bold text-xs rounded-t-2xl transition border-t-2 border-x-2 -mb-px whitespace-nowrap ${
                isActive
                  ? 'bg-white text-brand-700 border-slate-200 border-t-brand-600 shadow-sm'
                  : 'bg-slate-100/70 text-slate-600 border-transparent hover:bg-slate-200/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* محتوى التبويب المختار */}
      {currentTabObj.type === 'location' ? (
        /* تبويب مواقع الكاميرات */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 h-fit">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 text-slate-900 font-bold text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>إضافة موقع كاميرا جديد</span>
              </div>
              <button
                type="button"
                onClick={() => setBulkModalOpen(true)}
                className="text-[11px] font-black text-brand-700 hover:text-brand-900 flex items-center gap-1 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>لصق متعدد</span>
              </button>
            </div>

            <form onSubmit={handleAddLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم موقع الكاميرا (الشارع / التقاطع) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شارع الأردن - دوار الاستقلال"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المنطقة (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: شمال عمّان أو وسط البلد"
                  value={locationZone}
                  onChange={(e) => setLocationZone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{adding ? 'جاري الإضافة...' : 'إضافة موقع الكاميرا'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>مواقع الكاميرات المعتمدة</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                الإجمالي: {locations.length} موقع
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">اسم الموقع (الشارع / التقاطع)</th>
                    <th className="p-3">المنطقة</th>
                    <th className="p-3 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="text-center py-8 text-slate-400 font-bold">
                        جاري تحميل المواقع...
                      </td>
                    </tr>
                  ) : locations.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-8 text-slate-400 font-bold">
                        لا توجد مواقع كاميرات مسجلة حالياً. أضف أول موقع من النموذج الجانبي.
                      </td>
                    </tr>
                  ) : (
                    locations.map((loc) => (
                      <tr key={loc.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-800">{loc.name}</td>
                        <td className="p-3 text-slate-600">{loc.zone}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => openLocationDeleteConfirmation(loc)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="حذف الموقع"
                          >
                            <Trash2 className="w-4 h-4" />
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
        /* تبويبات الموظفين (المستخرجين، المدققين، المعدلين، المبلغين) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 h-fit">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 text-slate-900 font-bold text-sm">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand-600" />
                <span>إضافة {currentTabObj.singular} جديد</span>
              </div>
              <button
                type="button"
                onClick={() => setBulkModalOpen(true)}
                className="text-[11px] font-black text-brand-700 hover:text-brand-900 flex items-center gap-1 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>لصق متعدد من Excel</span>
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الموظف في الأمانة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 101 أو 5542"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الموظف الفعلي بالكامل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="أدخل الاسم الحقيقي للموظف..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{adding ? 'جاري الإضافة...' : `إضافة إلى قائمة ${currentTabObj.label}`}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-600" />
                <span>قائمة {currentTabObj.label} الفعليين</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                الإجمالي: {employees.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">الرقم</th>
                    <th className="p-3">الاسم الكامل</th>
                    <th className="p-3 text-center">المخالفات المرتبطة</th>
                    <th className="p-3 text-center">الحالة</th>
                    <th className="p-3 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-400 font-bold">
                        جاري التحميل...
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-400 font-bold">
                        لا يوجد موظفون مضافون حالياً. استخدم النموذج لإضافة أول {currentTabObj.singular}.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr
                        key={emp.id}
                        className={`hover:bg-slate-50 transition ${
                          emp.is_active === 0 ? 'opacity-50 bg-slate-100/50' : ''
                        }`}
                      >
                        <td className="p-3 font-black text-slate-900">{emp.number}</td>
                        <td className="p-3 font-bold text-slate-800">{emp.name}</td>
                        <td className="p-3 text-center font-black">
                          {emp.violations_count > 0 ? (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                              {emp.violations_count} مخالفة
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">لا توجد</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {emp.is_active === 1 ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 font-bold text-[11px]">
                              نشط
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md font-bold text-[11px]">
                              معطل
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {emp.is_active === 1 && (
                            <button
                              onClick={() => openDeleteConfirmation(emp)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-200"
                              title="إلغاء التفعيل / حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
    </div>
  );
}
