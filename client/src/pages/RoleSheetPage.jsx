import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import PrintHeader from '../components/PrintHeader';
import Pagination from '../components/Pagination';
import { formatDisplayDate } from '../utils/dateHelpers';
import { Printer, Search, User, Filter, FileSpreadsheet, AlertCircle, BarChart2, X, RotateCcw } from 'lucide-react';

const ROLE_CONFIGS = {
  extractor: { title: 'شيت المستخرجين', singular: 'المستخرج', idCol: 'extractor_id', nameCol: 'extractor_name', color: '#1d4ed8', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)', gradFrom: '#1e40af', gradTo: '#1d52d2' },
  auditor: { title: 'شيت المدققين', singular: 'المدقق', idCol: 'auditor_id', nameCol: 'auditor_name', color: '#0369a1', bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.15)', gradFrom: '#0c4a6e', gradTo: '#0369a1' },
  modifier: { title: 'شيت المعدلين', singular: 'المعدل', idCol: 'modifier_id', nameCol: 'modifier_name', color: '#0f766e', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.15)', gradFrom: '#134e4a', gradTo: '#0f766e' },
  reporter: { title: 'شيت المبلغين', singular: 'المبلغ', idCol: 'reporter_id', nameCol: 'reporter_name', color: '#be123c', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.15)', gradFrom: '#881337', gradTo: '#be123c' }
};

export default function RoleSheetPage() {
  const { role = 'extractor' } = useParams();
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.extractor;

  const [violations, setViolations] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [topErrors, setTopErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: 15 });
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [search, setSearch] = useState('');

  const fetchRoleData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/violations/by-role/${role}`, {
        params: { employeeNumber: selectedEmployee || undefined, search: search || undefined, page, limit: 15 }
      });
      setViolations(res.data.data || []);
      setEmployeeList(res.data.employeeList || []);
      setTopErrors(res.data.topErrors || []);
      setPagination(res.data.pagination || { page: 1, total: 0, totalPages: 1, limit: 15 });
    } catch (err) {
      console.error('فشل جلب بيانات شيت الدور:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoleData(1); }, [role, selectedEmployee]);

  const handleSearchSubmit = (e) => { e.preventDefault(); fetchRoleData(1); };

  const currentEmpObj = employeeList.find((e) => String(e.number) === String(selectedEmployee));

  const inputStyle = { background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' };
  const inputFocus = (e) => { e.target.style.borderColor = config.color; e.target.style.boxShadow = `0 0 0 3px ${config.color}22`; e.target.style.background = 'white'; };
  const inputBlur = (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; };

  return (
    <div className="space-y-5">
      <PrintHeader
        title={config.title}
        subtitle={
          selectedEmployee && currentEmpObj
            ? `كشف فردي خاص بـ ${config.singular}: ${currentEmpObj.name} (رقم: ${currentEmpObj.number}) — إجمالي السجلات: ${pagination.total}`
            : `كشف عام لجميع ${config.title} — إجمالي السجلات: ${pagination.total}`
        }
      />

      {/* رأس الصفحة */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold"
              style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}>
              <BarChart2 className="w-3.5 h-3.5" />
              <span>شيتات الفحص التخصصية</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', color: '#059669' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{pagination.total?.toLocaleString('ar')} سجل</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900">{config.title}</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">متابعة دقيقة لعمليات {config.title} مع إمكانية عرض وطباعة الكشف الفردي لكل موظف</p>
        </div>
        <button onClick={() => window.print()}
          className="no-print flex items-center gap-2 px-4 py-2.5 font-black rounded-xl text-xs text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: `linear-gradient(135deg,${config.gradFrom},${config.gradTo})`, boxShadow: `0 4px 12px ${config.color}40` }}>
          <Printer className="w-3.5 h-3.5" /><span>طباعة هذا الكشف</span>
        </button>
      </div>

      {/* شريط الفلترة والبحث */}
      <div className="no-print bg-white rounded-2xl p-5" style={{ border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide flex items-center gap-1">
              <User className="w-3 h-3" /> تصفية حسب {config.singular}
            </label>
            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none transition-all duration-200" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}>
              <option value="">-- جميع {config.title} (سجل مجمع) --</option>
              {employeeList.map((emp) => (<option key={emp.number} value={emp.number}>{emp.number} - {emp.name}</option>))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-extrabold text-slate-600 mb-1.5 uppercase tracking-wide">بحث في هذا الشيت</label>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input type="text" placeholder="بحث برقم المخالفة، رقم اللوحة، نوع الخطأ..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all duration-200" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                {search && (
                  <button type="button" onClick={() => setSearch('')} className="absolute left-8 top-2.5 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button type="submit" className="px-5 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg,${config.gradFrom},${config.gradTo})`, boxShadow: `0 4px 12px ${config.color}30` }}>
                <Search className="w-3.5 h-3.5" /><span>بحث</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* بطاقة ملخص الموظف الفردي */}
      {selectedEmployee && currentEmpObj && (
        <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ background: `linear-gradient(135deg,${config.gradFrom},${config.gradTo})` }}>
          <div>
            <span className="text-[11px] font-bold opacity-70 uppercase tracking-wider">كشف فردي نشط</span>
            <h3 className="text-lg font-black text-white mt-0.5">{config.singular}: {currentEmpObj.name} (رقم: {currentEmpObj.number})</h3>
            <p className="text-xs text-white/70 mt-1">إجمالي المخالفات المرتبطة بهذا الموظف: <strong className="text-white font-black">{pagination.total}</strong> مخالفة</p>
          </div>
          {topErrors.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/70 font-semibold">أبرز الأخطاء:</span>
              <div className="flex gap-1.5 flex-wrap">
                {topErrors.map((err) => (
                  <span key={err.error_type} className="px-2.5 py-1 rounded-lg text-[11px] font-bold" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                    {err.error_type} ({err.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* جدول البيانات */}
      <div className="bg-white rounded-2xl overflow-hidden printable-area" style={{ border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr style={{ background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', borderBottom: '2px solid #e2e8f0' }}>
                <th className="px-3.5 py-3.5 font-black text-slate-700 text-center w-12">م</th>
                <th className="px-3.5 py-3.5 font-black text-slate-700">رقم المخالفة</th>
                <th className="px-3.5 py-3.5 font-black text-slate-700">تاريخ المخالفة</th>
                <th className="px-3.5 py-3.5 font-black text-slate-700">المركبة الخطأ</th>
                <th className="px-3.5 py-3.5 font-black text-slate-700">المركبة الصحيح</th>
                <th className="px-3.5 py-3.5 font-black text-slate-700">طبيعة الخطأ</th>
                <th className="px-3.5 py-3.5 font-black text-slate-700">رقم {config.singular}</th>
                <th className="px-3.5 py-3.5 font-black text-slate-700">اسم {config.singular}</th>
                <th className="px-3.5 py-3.5 font-black text-slate-700">تاريخ الإدخال</th>
                <th className="px-3.5 py-3.5 font-black text-slate-700">اليوم</th>
                <th className="px-3.5 py-3.5 font-black text-slate-700">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {Array.from({ length: 11 }).map((_, j) => (
                      <td key={j} className="px-3.5 py-3.5"><div className="h-4 rounded-lg skeleton" style={{ width: `${50 + Math.random() * 50}%` }} /></td>
                    ))}
                  </tr>
                ))
              ) : violations.length === 0 ? (
                <tr><td colSpan="11">
                  <div className="empty-state">
                    <div className="empty-state-icon"><AlertCircle /></div>
                    <p className="empty-state-title">لا توجد سجلات مطابقة في {config.title}</p>
                    <p className="empty-state-desc">جرب تغيير معايير البحث أو الفلتر</p>
                  </div>
                </td></tr>
              ) : (
                violations.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={e => e.currentTarget.style.background = config.bg}
                    onMouseLeave={e => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafafa'}>
                    <td className="px-3.5 py-3.5 text-center font-bold text-slate-400">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                    <td className="px-3.5 py-3.5 font-black whitespace-nowrap" style={{ color: config.color }}>{item.violation_number}</td>
                    <td className="px-3.5 py-3.5 font-semibold text-slate-600 whitespace-nowrap">{formatDisplayDate(item.violation_date)}</td>
                    <td className="px-3.5 py-3.5 font-bold text-rose-700 whitespace-nowrap">{item.wrong_vehicle_number}</td>
                    <td className="px-3.5 py-3.5 font-bold text-emerald-700 whitespace-nowrap">{item.correct_vehicle_number}</td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg font-bold text-[11px]"
                        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#92400e' }}>
                        {item.error_type}
                      </span>
                    </td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap font-black text-slate-900">{item[config.idCol]}</td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap font-bold" style={{ color: config.color }}>{item[config.nameCol]}</td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap text-slate-500">{formatDisplayDate(item.entry_date)}</td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap font-bold text-slate-800">{item.entry_day}</td>
                    <td className="px-3.5 py-3.5 text-slate-500 max-w-xs truncate">{item.notes || <span className="text-slate-300">—</span>}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.total} onPageChange={(p) => fetchRoleData(p)} />
      </div>
    </div>
  );
}
