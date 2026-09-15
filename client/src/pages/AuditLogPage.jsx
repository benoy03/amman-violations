import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import PrintHeader from '../components/PrintHeader';
import Pagination from '../components/Pagination';
import { ShieldAlert, Search, Printer, RotateCcw, Clock, User, FileText, X, Shield } from 'lucide-react';

function ActionBadge({ action }) {
  const styles = {
    'INSERT': { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', color: '#065f46' },
    'UPDATE': { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', color: '#92400e' },
    'DELETE': { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', color: '#991b1b' },
    'LOGIN': { bg: 'rgba(38,104,229,0.1)', border: 'rgba(38,104,229,0.2)', color: '#1d52d2' },
  };
  const s = styles[action?.toUpperCase()] || { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', color: '#475569' };
  return (
    <span className="px-2.5 py-1 rounded-lg text-[11px] font-black whitespace-nowrap"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {action}
    </span>
  );
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: 20 });
  const [search, setSearch] = useState('');

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs', { params: { search: search || undefined, page, limit: 20 } });
      setLogs(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, total: 0, totalPages: 1, limit: 20 });
    } catch (err) {
      console.error('فشل جلب سجل الرقابة:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(1); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchLogs(1); };

  return (
    <div className="space-y-5">
      <PrintHeader title="سجل الرقابة وتدقيق العمليات" subtitle="توثيق حركات الإدخال والتعديل في قسم المخالفات" />

      {/* رأس الصفحة */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', color: '#6d28d9' }}>
              <Shield className="w-3.5 h-3.5" />
              <span>رقابة الجودة والمساءلة</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', color: '#059669' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{pagination.total?.toLocaleString('ar')} حركة</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900">سجل العمليات والتدقيق (Audit Trail)</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">توثيق دقيق لكل عملية ترحيل، تعديل، أو إضافة تتم على النظام مع اسم الموظف والتوقيت</p>
        </div>
        <button onClick={() => window.print()}
          className="no-print flex items-center gap-2 px-4 py-2.5 font-black rounded-xl text-xs text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg,#6d28d9,#5b21b6)', boxShadow: '0 4px 12px rgba(109,40,217,0.3)' }}>
          <Printer className="w-3.5 h-3.5" /><span>طباعة السجل</span>
        </button>
      </div>

      {/* شريط البحث */}
      <div className="no-print bg-white rounded-2xl p-4" style={{ border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="بحث باسم المستخدم، نوع الإجراء، أو التفاصيل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium outline-none transition-all duration-200"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}
              onFocus={e => { e.target.style.borderColor = '#6d28d9'; e.target.style.boxShadow = '0 0 0 3px rgba(109,40,217,0.1)'; e.target.style.background = 'white'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute left-8 top-2.5 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#6d28d9,#5b21b6)', boxShadow: '0 4px 12px rgba(109,40,217,0.25)' }}>
            <Search className="w-3.5 h-3.5" /><span>بحث</span>
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setTimeout(() => fetchLogs(1), 50); }}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#dc2626' }}>
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* جدول الحركات */}
      <div className="bg-white rounded-2xl overflow-hidden printable-area" style={{ border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr style={{ background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', borderBottom: '2px solid #e2e8f0' }}>
                <th className="px-3.5 py-3.5 font-black text-slate-700 text-center w-12">م</th>
                <th className="px-3.5 py-3.5 font-black text-slate-700">التوقيت والتاريخ</th>
                <th className="px-3.5 py-3.5 font-black text-slate-700">اسم المستخدم</th>
                <th className="px-3.5 py-3.5 font-black text-slate-700">نوع الإجراء</th>
                <th className="px-3.5 py-3.5 font-black text-slate-700">الجهة / الرقم</th>
                <th className="px-3.5 py-3.5 font-black text-slate-700">تفاصيل العملية</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: '0' }}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-3.5 py-3.5">
                        <div className="h-4 rounded-lg skeleton" style={{ width: `${50 + Math.random() * 50}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <div className="empty-state-icon"><FileText /></div>
                      <p className="empty-state-title">لا توجد حركات مسجلة</p>
                      <p className="empty-state-desc">ستظهر العمليات هنا بمجرد بدء استخدام النظام</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={log.id} className="transition-colors hoverable-row" style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(109,40,217,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-3.5 py-3.5 text-center font-bold text-slate-400">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(log.created_at).toLocaleString('ar-JO')}</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#6d28d9,#5b21b6)' }}>
                          {log.username?.charAt(0)?.toUpperCase() || 'م'}
                        </div>
                        <span className="font-bold text-slate-900">{log.username}</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-3.5 py-3.5 font-black text-slate-800 whitespace-nowrap">
                      {log.entity_id || log.entity}
                    </td>
                    <td className="px-3.5 py-3.5 text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details || <span className="text-slate-300">—</span>}
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
