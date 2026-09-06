import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import PrintHeader from '../components/PrintHeader';
import Pagination from '../components/Pagination';
import { ShieldAlert, Search, Printer, RotateCcw, Clock, User, FileText } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: 20 });
  const [search, setSearch] = useState('');

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs', {
        params: { search: search || undefined, page, limit: 20 }
      });
      setLogs(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, total: 0, totalPages: 1, limit: 20 });
    } catch (err) {
      console.error('فشل جلب سجل الرقابة:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  return (
    <div className="space-y-6">
      <PrintHeader
        title="سجل الرقابة وتدقيق العمليات"
        subtitle="توثيق حركات الإدخال والتعديل في قسم المخالفات"
      />

      <div className="no-print bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1 w-max">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>رقابة الجودة والمساءلة المؤسسية</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            سجل العمليات والتدقيق (Audit Trail)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            توثيق دقيق لكل عملية ترحيل، تعديل، أو إضافة تتم على النظام مع اسم الموظف والتوقيت
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-brand-600/30"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة السجل</span>
        </button>
      </div>

      {/* البحث في السجل */}
      <div className="no-print bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="بحث باسم المستخدم، نوع الإجراء، أو التفاصيل..."
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

      {/* جدول الحركات */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden printable-area">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-200">
                <th className="p-3.5 w-12 text-center">م</th>
                <th className="p-3.5">التوقيت والتاريخ</th>
                <th className="p-3.5">اسم المستخدم</th>
                <th className="p-3.5">نوع الإجراء</th>
                <th className="p-3.5">الجهة / الرقم</th>
                <th className="p-3.5">تفاصيل العملية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 font-bold">
                    جاري تحميل سجل الرقابة...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 font-bold">
                    لا توجد حركات مسجلة
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 text-center font-bold text-slate-400">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(log.created_at).toLocaleString('ar-JO')}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-brand-600" />
                        <span>{log.username}</span>
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-brand-50 text-brand-800 border border-brand-200 rounded-lg font-bold text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-black text-slate-800 whitespace-nowrap">
                      {log.entity_id || log.entity}
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-md">
                      {log.details || '-'}
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
          onPageChange={(p) => fetchLogs(p)}
        />
      </div>
    </div>
  );
}
