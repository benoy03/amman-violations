import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import PrintHeader from '../components/PrintHeader';
import Pagination from '../components/Pagination';
import JordanianPlate from '../components/JordanianPlate';
import ExcelImportModal from '../components/ExcelImportModal';
import ViolationDetailModal from '../components/ViolationDetailModal';
import { downloadSecureFile } from '../utils/fileDownloader';
import { useToast } from '../context/ToastContext';
import { formatDisplayDate } from '../utils/dateHelpers';
import {
  Printer, Search, ArrowUpDown, FileSpreadsheet, UploadCloud,
  RotateCcw, MapPin, Eye, Table2, SlidersHorizontal, X,
  Video, ChevronDown, ChevronUp
} from 'lucide-react';

function SortIcon({ column, sortBy, sortOrder }) {
  if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 text-slate-400 flex-shrink-0" />;
  return sortOrder === 'ASC'
    ? <ChevronUp className="w-3 h-3 text-brand-500 flex-shrink-0" />
    : <ChevronDown className="w-3 h-3 text-brand-500 flex-shrink-0" />;
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 14 }).map((_, i) => (
        <td key={i} className="p-3.5">
          <div className="h-4 rounded-lg skeleton" style={{ width: `${50 + Math.random() * 50}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function ViolationsListPage() {
  const [violations, setViolations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: 15 });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toast = useToast();

  const [search, setSearch] = useState('');
  const [jurisdiction, setJurisdiction] = useState('الكل');
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
        params: { search, jurisdiction: jurisdiction !== 'الكل' ? jurisdiction : undefined, startDate, endDate, errorType, location, sortBy, sortOrder, page, limit: 15 }
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
  }, []);

  useEffect(() => {
    fetchViolations(1);
  }, [sortBy, sortOrder, errorType, location, jurisdiction]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchViolations(1);
  };

  const handleResetFilters = () => {
    setSearch(''); setJurisdiction('الكل'); setStartDate(''); setEndDate('');
    setErrorType(''); setLocation(''); setSortBy('id'); setSortOrder('DESC');
    setTimeout(() => fetchViolations(1), 50);
  };

  const handleSort = (column) => {
    if (sortBy === column) setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    else { setSortBy(column); setSortOrder('DESC'); }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await downloadSecureFile('/violations/export-excel', `Amman_Violations_${today}.xlsx`);
      toast.success('تم تصدير سجل المخالفات إلى Excel بنجاح');
    } catch (err) {
      toast.error('فشل تصدير ملف Excel: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const hasActiveFilters = search || startDate || endDate || errorType || location || jurisdiction !== 'الكل';

  return (
    <div className="space-y-5">
      <PrintHeader title="سجل تعديل مخالفات الكاميرات العام" subtitle={`أمانة عمّان الكبرى — إجمالي المخالفات المسجلة: ${pagination.total}`} />

      {/* رأس الصفحة */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold"
              style={{ background: 'rgba(38,104,229,0.08)', border: '1px solid rgba(38,104,229,0.12)', color: '#1d52d2' }}>
              <Table2 className="w-3.5 h-3.5" />
              <span>السجل العام</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', color: '#059669' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{pagination.total?.toLocaleString('ar')} مخالفة</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900">سجل المخالفات الكامل</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">استعراض وتدقيق وتعديل كافة المخالفات مع مقارنة بصرية للوحات</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 font-bold rounded-xl text-xs transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#1d4ed8' }}>
            <UploadCloud className="w-3.5 h-3.5" />
            <span>استيراد Excel</span>
          </button>

          <button onClick={handleExportExcel} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 font-bold rounded-xl text-xs transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669' }}>
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{exporting ? 'جاري التصدير...' : 'تصدير Excel'}</span>
          </button>

          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 font-black rounded-xl text-xs text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #2668e5, #1d52d2)', boxShadow: '0 4px 12px rgba(38,104,229,0.3)' }}>
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة</span>
          </button>
        </div>
      </div>

      {/* شريط الفلاتر */}
      <div className="no-print bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {/* اختصاص + بحث سريع */}
        <div className="p-4 flex flex-col sm:flex-row items-center gap-3">
          {/* اختصاص */}
          <div className="flex items-center gap-1 p-1 rounded-xl flex-shrink-0" style={{ background: '#f1f5f9' }}>
            {[
              { id: 'الكل', label: 'الكل', emoji: '📋' },
              { id: 'سير', label: 'سير', emoji: '🚦' },
              { id: 'دوريات خارجية', label: 'دوريات', emoji: '🚓' }
            ].map((j) => (
              <button
                key={j.id}
                onClick={() => setJurisdiction(j.id)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-black transition-all duration-200"
                style={jurisdiction === j.id ? {
                  background: j.id === 'دوريات خارجية' ? 'linear-gradient(135deg,#d97706,#b45309)' : j.id === 'سير' ? 'linear-gradient(135deg,#2668e5,#1d52d2)' : 'linear-gradient(135deg,#374151,#1f2937)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                } : {
                  background: 'transparent',
                  color: '#64748b',
                }}
              >
                {j.emoji} {j.label}
              </button>
            ))}
          </div>

          {/* بحث */}
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث برقم المخالفة، رقم اللوحة، اسم الموظف..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all duration-200"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                }}
                onFocus={e => { e.target.style.borderColor = '#2668e5'; e.target.style.boxShadow = '0 0 0 3px rgba(38,104,229,0.1)'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="absolute left-8 top-2.5 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button type="submit"
              className="px-4 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#2668e5,#1d52d2)', boxShadow: '0 4px 12px rgba(38,104,229,0.25)' }}>
              <Search className="w-3.5 h-3.5" />
              <span>بحث</span>
            </button>
          </form>

          {/* فلاتر إضافية toggle */}
          <button onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex-shrink-0"
            style={{
              background: filtersOpen ? 'rgba(38,104,229,0.1)' : '#f1f5f9',
              border: `1px solid ${filtersOpen ? 'rgba(38,104,229,0.2)' : '#e2e8f0'}`,
              color: filtersOpen ? '#2668e5' : '#64748b',
            }}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>فلاتر</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-brand-500" />}
          </button>

          {hasActiveFilters && (
            <button onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#dc2626' }}>
              <RotateCcw className="w-3.5 h-3.5" />
              <span>مسح</span>
            </button>
          )}
        </div>

        {/* الفلاتر الإضافية */}
        {filtersOpen && (
          <div className="px-4 pb-4 pt-0 animate-slide-down" style={{ borderTop: '1px solid #f1f5f9' }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">موقع الكاميرا</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold outline-none"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#374151' }}>
                  <option value="">كل المواقع</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>{loc.name} {loc.code ? `[${loc.code}]` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">من تاريخ</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold outline-none"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">إلى تاريخ</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold outline-none"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }} />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={() => { setFiltersOpen(false); handleResetFilters(); }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b' }}>
                  <RotateCcw className="w-3.5 h-3.5" />
                  إعادة ضبط
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* جدول البيانات */}
      <div className="bg-white rounded-2xl overflow-hidden printable-area"
        style={{ border: '1px solid rgba(15,23,42,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.06)' }}>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr style={{ background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)', borderBottom: '2px solid #e2e8f0' }}>
                <th className="px-3.5 py-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-wider w-10">#</th>
                {[
                  { label: 'رقم المخالفة', col: 'violation_number' },
                  { label: 'الاختصاص', col: null },
                  { label: 'التاريخ', col: 'violation_date' },
                  { label: 'اللوحة الخطأ', col: null },
                  { label: 'اللوحة الصحيحة', col: null },
                  { label: 'نوع الخطأ', col: null },
                  { label: 'موقع الكاميرا', col: null },
                  { label: 'المستخرج', col: null },
                  { label: 'المدقق', col: null },
                  { label: 'المعدل', col: null },
                  { label: 'المبلغ', col: null },
                  { label: 'تاريخ الإدخال', col: null },
                ].map(({ label, col }) => (
                  <th
                    key={label}
                    className={`px-3.5 py-3 text-[10px] font-black text-slate-600 uppercase tracking-wider whitespace-nowrap ${col ? 'cursor-pointer hover:bg-slate-100 transition-colors' : ''}`}
                    onClick={col ? () => handleSort(col) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      <span>{label}</span>
                      {col && <SortIcon column={col} sortBy={sortBy} sortOrder={sortOrder} />}
                    </div>
                  </th>
                ))}
                <th className="px-3.5 py-3 text-center text-[10px] font-black text-slate-600 uppercase tracking-wider no-print">إجراءات</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : violations.length === 0 ? (
                <tr>
                  <td colSpan="14">
                    <div className="empty-state py-20">
                      <div className="empty-state-icon">
                        <Search className="w-7 h-7" />
                      </div>
                      <p className="empty-state-title">لا توجد سجلات مطابقة</p>
                      <p className="empty-state-desc">حاول تعديل فلاتر البحث أو إعادة الضبط</p>
                    </div>
                  </td>
                </tr>
              ) : (
                violations.map((item, index) => (
                  <tr
                    key={item.id}
                    onClick={() => { setSelectedViolation(item); setIsDetailModalOpen(true); }}
                    className="cursor-pointer transition-colors duration-100 border-b"
                    style={{ borderColor: '#f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(38,104,229,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = index % 2 === 0 ? 'white' : 'rgba(248,250,252,0.5)'}
                  >
                    {/* رقم الصف */}
                    <td className="px-3.5 py-3 text-center">
                      <span className="text-[11px] font-black text-slate-400">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </span>
                    </td>

                    {/* رقم المخالفة */}
                    <td className="px-3.5 py-3">
                      <span className="font-black text-brand-800 text-xs tracking-wide">{item.violation_number}</span>
                    </td>

                    {/* الاختصاص */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black"
                        style={item.jurisdiction === 'دوريات خارجية' ? {
                          background: 'rgba(217,119,6,0.1)',
                          border: '1px solid rgba(217,119,6,0.25)',
                          color: '#92400e',
                        } : {
                          background: 'rgba(5,150,105,0.08)',
                          border: '1px solid rgba(5,150,105,0.2)',
                          color: '#064e3b',
                        }}
                      >
                        {item.jurisdiction === 'دوريات خارجية' ? '🚓' : '🚦'}
                        <span>{item.jurisdiction === 'دوريات خارجية' ? 'دوريات' : 'سير'}</span>
                      </span>
                    </td>

                    {/* التاريخ */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className="text-xs font-bold text-slate-600">{formatDisplayDate(item.violation_date)}</span>
                    </td>

                    {/* اللوحات */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <JordanianPlate plateNumber={item.wrong_vehicle_number} isWrong={true} size="sm" />
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <JordanianPlate plateNumber={item.correct_vehicle_number} isWrong={false} size="sm" />
                    </td>

                    {/* نوع الخطأ */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#92400e' }}>
                        {item.error_type}
                      </span>
                    </td>

                    {/* موقع الكاميرا */}
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <MapPin className="w-3 h-3 text-brand-500 flex-shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 max-w-32 truncate">{item.camera_location || '—'}</span>
                        {item.location_code && (
                          <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded-md"
                            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569' }}>
                            {item.location_code}
                          </span>
                        )}
                        {item.video_url && (
                          <Video className="w-3 h-3 text-blue-500 flex-shrink-0" title="يوجد فيديو" />
                        )}
                      </div>
                    </td>

                    {/* الموظفون */}
                    {[
                      { id: item.extractor_id, name: item.extractor_name, color: '#1d4ed8' },
                      { id: item.auditor_id, name: item.auditor_name, color: '#0369a1' },
                      { id: item.modifier_id, name: item.modifier_name, color: '#0d7377' },
                      { id: item.reporter_id, name: item.reporter_name, color: '#be185d' },
                    ].map(({ id, name, color }, i) => (
                      <td key={i} className="px-3.5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md text-white flex-shrink-0"
                            style={{ background: color, minWidth: '28px', textAlign: 'center' }}>
                            {id}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 max-w-24 truncate">{name}</span>
                        </div>
                      </td>
                    ))}

                    {/* تاريخ الإدخال */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className="text-xs font-bold text-slate-500">{item.entry_day} {formatDisplayDate(item.entry_date)}</span>
                    </td>

                    {/* الإجراءات */}
                    <td className="px-3.5 py-3 text-center no-print" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => { setSelectedViolation(item); setIsDetailModalOpen(true); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          background: 'rgba(38,104,229,0.08)',
                          border: '1px solid rgba(38,104,229,0.2)',
                          color: '#2668e5',
                          boxShadow: '0 1px 4px rgba(38,104,229,0.1)',
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ترقيم الصفحات */}
        <div className="px-5 pb-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={(p) => fetchViolations(p)}
          />
        </div>
      </div>

      {/* النوافذ المنبثقة */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => { fetchViolations(1); setIsImportModalOpen(false); }}
      />

      <ViolationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedViolation(null); }}
        violation={selectedViolation}
        onUpdateSuccess={(updated) => {
          setViolations((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
          setSelectedViolation(updated);
        }}
        onDeleteSuccess={(deletedId) => {
          setViolations((prev) => prev.filter((v) => v.id !== deletedId));
          setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        }}
      />
    </div>
  );
}
