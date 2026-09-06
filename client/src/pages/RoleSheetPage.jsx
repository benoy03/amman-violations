import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import PrintHeader from '../components/PrintHeader';
import Pagination from '../components/Pagination';
import { formatDisplayDate } from '../utils/dateHelpers';
import {
  Printer,
  Search,
  User,
  Filter,
  FileSpreadsheet,
  AlertCircle,
  BarChart2
} from 'lucide-react';

const ROLE_CONFIGS = {
  extractor: {
    title: 'شيت المستخرجين',
    singular: 'المستخرج',
    idCol: 'extractor_id',
    nameCol: 'extractor_name',
    color: 'blue'
  },
  auditor: {
    title: 'شيت المدققين',
    singular: 'المدقق',
    idCol: 'auditor_id',
    nameCol: 'auditor_name',
    color: 'sky'
  },
  modifier: {
    title: 'شيت المعدلين',
    singular: 'المعدل',
    idCol: 'modifier_id',
    nameCol: 'modifier_name',
    color: 'teal'
  },
  reporter: {
    title: 'شيت المبلغين',
    singular: 'المبلغ',
    idCol: 'reporter_id',
    nameCol: 'reporter_name',
    color: 'rose'
  }
};

export default function RoleSheetPage() {
  const { role = 'extractor' } = useParams();
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.extractor;

  const [violations, setViolations] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [topErrors, setTopErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: 15 });

  // فلاتر
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [search, setSearch] = useState('');

  const fetchRoleData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/violations/by-role/${role}`, {
        params: {
          employeeNumber: selectedEmployee || undefined,
          search: search || undefined,
          page,
          limit: 15
        }
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

  useEffect(() => {
    fetchRoleData(1);
  }, [role, selectedEmployee]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRoleData(1);
  };

  const handlePrint = () => {
    window.print();
  };

  // الموظف المختار حالياً لعرض اسمه في التقرير
  const currentEmpObj = employeeList.find((e) => String(e.number) === String(selectedEmployee));

  return (
    <div className="space-y-6">
      {/* ترويسة الطباعة */}
      <PrintHeader
        title={config.title}
        subtitle={
          selectedEmployee && currentEmpObj
            ? `كشف فردي خاص بـ ${config.singular}: ${currentEmpObj.name} (رقم: ${currentEmpObj.number}) — إجمالي السجلات: ${pagination.total}`
            : `كشف عام لجميع ${config.title} — إجمالي السجلات: ${pagination.total}`
        }
      />

      {/* الرأس وعناصر التحكم في الشاشة */}
      <div className="no-print bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
            شيتات الفحص التخصصية
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {config.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            متابعة دقيقة لعمليات {config.title} مع إمكانية عرض وطباعة الكشف الفردي لكل موظف
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-brand-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة هذا الكشف</span>
          </button>
        </div>
      </div>

      {/* شريط الفلترة الفردية والبحث */}
      <div className="no-print bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* فلتر الموظف الفردي (كشف فردي) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-600" />
              <span>تصفية حسب {config.singular} (كشف فردي):</span>
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- جميع {config.title} (سجل مجمع) --</option>
              {employeeList.map((emp) => (
                <option key={emp.number} value={emp.number}>
                  {emp.number} - {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* البحث السريع */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              بحث في هذا الشيت:
            </label>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="بحث برقم المخالفة، رقم اللوحة، نوع الخطأ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition"
              >
                بحث
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* بطاقة ملخص الموظف أو الدور */}
      {selectedEmployee && currentEmpObj && (
        <div className="bg-gradient-to-r from-brand-900 to-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-brand-300 uppercase">
              كشف فردي نشط
            </span>
            <h3 className="text-lg font-black mt-0.5">
              {config.singular}: {currentEmpObj.name} (رقم: {currentEmpObj.number})
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              إجمالي المخالفات المرتبطة بهذا الموظف: <strong className="text-white font-black">{pagination.total}</strong> مخالفة
            </p>
          </div>

          {topErrors.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-300 font-semibold">أبرز الأخطاء:</span>
              <div className="flex gap-1.5 flex-wrap">
                {topErrors.map((err) => (
                  <span
                    key={err.error_type}
                    className="px-2.5 py-1 bg-white/10 rounded-lg border border-white/15 text-[11px]"
                  >
                    {err.error_type} ({err.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* جدول البيانات */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden printable-area">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 text-xs font-black uppercase">
                <th className="p-3.5 w-12 text-center">م</th>
                <th className="p-3.5">رقم المخالفة</th>
                <th className="p-3.5">تاريخ المخالفة</th>
                <th className="p-3.5">المركبة الخطأ</th>
                <th className="p-3.5">المركبة الصحيح</th>
                <th className="p-3.5">طبيعة الخطأ</th>
                <th className="p-3.5">رقم {config.singular}</th>
                <th className="p-3.5">اسم {config.singular}</th>
                <th className="p-3.5">تاريخ الإدخال</th>
                <th className="p-3.5">اليوم</th>
                <th className="p-3.5">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center py-12 text-slate-400 font-bold">
                    جاري تحميل السجلات...
                  </td>
                </tr>
              ) : violations.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-12 text-slate-400 font-bold">
                    لا توجد سجلات مطابقة في {config.title}
                  </td>
                </tr>
              ) : (
                violations.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-brand-50/40 transition odd:bg-white even:bg-slate-50/50"
                  >
                    <td className="p-3.5 text-center font-bold text-slate-500">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="p-3.5 font-black text-brand-900 whitespace-nowrap">
                      {item.violation_number}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-600 whitespace-nowrap">
                      {formatDisplayDate(item.violation_date)}
                    </td>
                    <td className="p-3.5 font-bold text-rose-700 whitespace-nowrap">
                      {item.wrong_vehicle_number}
                    </td>
                    <td className="p-3.5 font-bold text-emerald-700 whitespace-nowrap">
                      {item.correct_vehicle_number}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold text-[11px]">
                        {item.error_type}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-black text-slate-900">
                      {item[config.idCol]}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-bold text-brand-800">
                      {item[config.nameCol]}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-500">
                      {formatDisplayDate(item.entry_date)}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-bold text-slate-800">
                      {item.entry_day}
                    </td>
                    <td className="p-3.5 text-slate-500 max-w-xs truncate">
                      {item.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={(p) => fetchRoleData(p)}
        />
      </div>
    </div>
  );
}
