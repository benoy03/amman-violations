import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import PrintHeader from '../components/PrintHeader';
import Pagination from '../components/Pagination';
import JordanianPlate from '../components/JordanianPlate';
import ExcelImportModal from '../components/ExcelImportModal';
import { formatDisplayDate } from '../utils/dateHelpers';
import {
  Printer,
  Search,
  ArrowUpDown,
  FileSpreadsheet,
  UploadCloud,
  RotateCcw,
  MapPin,
  Camera
} from 'lucide-react';

export default function ViolationsListPage() {
  const [violations, setViolations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: 15 });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // فلاتر البحث والفرز
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorType, setErrorType] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('DESC');

  const fetchViolations = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/violations', {
        params: {
          search,
          startDate,
          endDate,
          errorType,
          location,
          sortBy,
          sortOrder,
          page,
          limit: 15
        }
      });
      setViolations(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, total: 0, totalPages: 1, limit: 15 });
    } catch (err) {
      console.error('فشل جلب سجل المخالفات:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await api.get('/locations');
        setLocations(res.data.data || []);
      } catch {}
    }
    fetchLocations();
    fetchViolations(1);
  }, [sortBy, sortOrder, errorType, location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchViolations(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setErrorType('');
    setLocation('');
    setSortBy('id');
    setSortOrder('DESC');
    setTimeout(() => fetchViolations(1), 50);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('DESC');
    }
  };

  const handleExportExcel = () => {
    window.open('/api/violations/export-excel', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* ترويسة الطباعة الرسمية */}
      <PrintHeader
        title="سجل تعديل مخالفات الكاميرات العام"
        subtitle={`أمانة عمّان الكبرى — إجمالي المخالفات المسجلة: ${pagination.total}`}
      />

      {/* الرأس وعناصر التحكم في الشاشة */}
      <div className="no-print bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
            أمانة عمّان الكبرى — السجل العام
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            سجل المخالفات الكامل
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            استعراض كافة المخالفات المرحلة مع عرض شكل اللوحات الأردنية ومواقع الكاميرات
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* زر استيراد Excel */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition border border-blue-200"
            title="استيراد دفعة من ملف Excel"
          >
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <span>استيراد Excel</span>
          </button>

          {/* زر تصدير Excel */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition border border-emerald-200"
            title="تصدير جدول Excel منسق (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير Excel (.xlsx)</span>
          </button>

          {/* زر طباعة السجل */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-brand-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة السجل</span>
          </button>
        </div>
      </div>

      {/* شريط الفلاتر والبحث */}
      <div className="no-print bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* البحث السريع */}
            <div className="lg:col-span-2 relative">
              <input
                type="text"
                placeholder="بحث برقم المخالفة، رقم اللوحة، اسم الموظف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            {/* فلتر موقع الكاميرا */}
            <div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white outline-none"
              >
                <option value="">-- كل الكاميرات والمواقع --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* من تاريخ */}
            <div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none"
                title="من تاريخ المخالفة"
              />
            </div>

            {/* إلى تاريخ */}
            <div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none"
                title="إلى تاريخ المخالفة"
              />
            </div>

            {/* أزرار البحث وإعادة الضبط */}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>تطبيق</span>
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border border-slate-300 text-xs"
                title="إعادة ضبط الفلاتر"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* جدول البيانات الكامل مع اللوحات الأردنية الواقعية */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden printable-area">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider">
                <th className="p-3.5 w-12 text-center">م</th>
                <th
                  onClick={() => handleSort('violation_number')}
                  className="p-3.5 cursor-pointer hover:bg-slate-200 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>رقم المخالفة</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 no-print" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('violation_date')}
                  className="p-3.5 cursor-pointer hover:bg-slate-200 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>تاريخ المخالفة</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 no-print" />
                  </div>
                </th>
                <th className="p-3.5">المركبة الخطأ</th>
                <th className="p-3.5">المركبة الصحيح</th>
                <th className="p-3.5">طبيعة الخطأ</th>
                <th className="p-3.5">موقع الكاميرا</th>
                <th className="p-3.5">المستخرج</th>
                <th className="p-3.5">المدقق</th>
                <th className="p-3.5">المعدل</th>
                <th className="p-3.5">المبلغ</th>
                <th className="p-3.5">اليوم والتاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="12" className="text-center py-12 text-slate-400 font-bold">
                    جاري تحميل سجل المخالفات...
                  </td>
                </tr>
              ) : violations.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-12 text-slate-400 font-bold">
                    لا توجد سجلات مخالفات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                violations.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-brand-50/40 transition duration-150 odd:bg-white even:bg-slate-50/50"
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
                    <td className="p-3.5 whitespace-nowrap">
                      <JordanianPlate plateNumber={item.wrong_vehicle_number} isWrong={true} size="sm" />
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <JordanianPlate plateNumber={item.correct_vehicle_number} isWrong={false} size="sm" />
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold text-[11px]">
                        {item.error_type}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-medium text-slate-700">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-600" />
                        <span>{item.camera_location || 'شارع الأردن'}</span>
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-medium">
                      <span className="font-bold text-slate-900">{item.extractor_id}</span> - {item.extractor_name}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-medium">
                      <span className="font-bold text-slate-900">{item.auditor_id}</span> - {item.auditor_name}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-medium">
                      <span className="font-bold text-slate-900">{item.modifier_id}</span> - {item.modifier_name}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-medium">
                      <span className="font-bold text-slate-900">{item.reporter_id}</span> - {item.reporter_name}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-bold text-brand-800">
                      {item.entry_day} ({formatDisplayDate(item.entry_date)})
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
          onPageChange={(p) => fetchViolations(p)}
        />
      </div>

      {/* نافذة استيراد Excel */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          fetchViolations(1);
          setIsImportModalOpen(false);
        }}
      />
    </div>
  );
}
