import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import PrintHeader from '../components/PrintHeader';
import StatCard from '../components/StatCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import {
  Printer,
  Calendar,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle,
  MapPin,
  PieChart as PieIcon,
  Building2
} from 'lucide-react';

const PERIODS = [
  { id: 'day', label: 'يومي (اليوم)' },
  { id: 'week', label: 'أسبوعي (7 أيام)' },
  { id: 'month', label: 'شهري (الحالي)' },
  { id: 'quarter', label: 'ربعي (3 أشهر)' },
  { id: 'half', label: 'نصفي (6 أشهر)' },
  { id: 'year', label: 'سنوي (السنة)' },
  { id: 'custom', label: 'مدى مخصص...' }
];

export default function ReportsPage() {
  const [period, setPeriod] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/statistics', {
        params: {
          period,
          startDate: period === 'custom' ? customStart : undefined,
          endDate: period === 'custom' ? customEnd : undefined
        }
      });
      setStats(res.data);
    } catch (err) {
      console.error('فشل جلب الإحصائيات:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (period !== 'custom') {
      fetchStats();
    }
  }, [period]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customStart && customEnd) {
      fetchStats();
    }
  };

  const chartColors = ['#1e40af', '#0284c7', '#0d9488', '#e11d48'];
  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* ترويسة الطباعة الرسمية */}
      <PrintHeader
        title="تقرير وإحصائيات تعديل مخالفات الكاميرات الرقابية"
        subtitle={`أمانة عمّان الكبرى — الفترة: ${stats?.dateRange?.label || period} (${stats?.dateRange?.startDate} إلى ${stats?.dateRange?.endDate})`}
      />

      {/* الرأس وعناصر التحكم في الشاشة */}
      <div className="no-print bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-100 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>أمانة عمّان الكبرى</span>
            </span>
            <span className="text-xs font-bold text-slate-500">لوحة المؤشرات والتحليلات</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            التقارير والإحصائيات الدورية
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            تحليل شامل لعمليات تدقيق الكاميرات، وتوزيع الأخطاء على مواقع شوارع عمّان
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-brand-600/30"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة التقرير أو تصدير PDF</span>
        </button>
      </div>

      {/* شريط اختيار الفترة الزمنية */}
      <div className="no-print bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>اختر الفترة الزمنية للتقرير:</span>
          </span>

          <span className="text-xs font-semibold text-slate-500">
            الفترة الحالية:{' '}
            <strong className="text-brand-800 font-bold">
              {stats?.dateRange?.label}
            </strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                period === p.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <form
            onSubmit={handleCustomSubmit}
            className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 animate-in fade-in"
          >
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">من تاريخ:</label>
              <input
                type="date"
                required
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">إلى تاريخ:</label>
              <input
                type="date"
                required
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition"
            >
              تطبيق الفترة المخصصة
            </button>
          </form>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 font-bold">
          جاري استخراج وتجميع الإحصائيات...
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* بطاقات المؤشرات العامة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="إجمالي الأخطاء في الفترة"
              value={stats.summary.totalViolationsInPeriod}
              subtext={`من أصل ${stats.summary.overallTotal} مخالفة مسجلة كلياً`}
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              title="أكثر خطأ متكرر"
              value={stats.summary.mostCommonError?.count || 0}
              subtext={stats.summary.mostCommonError?.error_type || 'لا توجد بيانات'}
              icon={AlertTriangle}
              color="amber"
            />
            <StatCard
              title="أكثر موقع كاميرا أخطاء"
              value={stats.summary.topCameraHotspot?.count || 0}
              subtext={stats.summary.topCameraHotspot?.location || 'لا توجد بيانات'}
              icon={MapPin}
              color="red"
            />
            <StatCard
              title="أكثر معدل أخطاء"
              value={stats.summary.topModifier?.count || 0}
              subtext={stats.summary.topModifier?.name || 'لا توجد بيانات'}
              icon={CheckCircle}
              color="teal"
            />
          </div>

          {/* قسم الرسوم البيانية المتطورة (Bar Chart + Donut Chart) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* الرسم البياني المقارن للأدوار */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 printable-area">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-brand-600" />
                    <span>مقارنة إجمالي العمليات بين الأدوار الأربعة (أمانة عمّان)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    المستخرجون مقابل المدققين والمعدلين والمبلغين لنفس الفترة ({stats.dateRange?.label})
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.comparisonSeries} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="role" tick={{ fill: '#334155', fontSize: 12, fontWeight: 'bold' }} axisLine={{ stroke: '#cbd5e1' }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#cbd5e1' }} />
                    <Tooltip
                      formatter={(val) => [`${val} عملية / خطأ`, 'العدد']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '12px',
                        direction: 'rtl',
                        textAlign: 'right'
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={60}>
                      {stats.comparisonSeries.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* الرسم الدائري لتوزيع الأخطاء */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 printable-area">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
                <PieIcon className="w-5 h-5 text-indigo-600" />
                <span>توزيع نسب طبيعة الأخطاء</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.errorTypesStats}
                      dataKey="count"
                      nameKey="error_type"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {stats.errorTypesStats.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val, name) => [`${val} حالة`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 mt-2 text-[11px] max-h-24 overflow-y-auto pr-1">
                {stats.errorTypesStats.map((e, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pieColors[idx % pieColors.length] }}></span>
                      <span className="truncate">{e.error_type}</span>
                    </span>
                    <span className="font-bold">{e.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* تحليل مواقع كاميرات عمّان (Amman Camera Hotspots) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 printable-area">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>إحصائيات مواقع الكاميرات في عمّان (الأكثر تسجيلاً للأخطاء)</span>
              </h4>
              <span className="text-xs font-bold text-slate-500">
                {stats.cameraLocationsStats?.length || 0} موقع كاميرا نشط
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">موقع الكاميرا (الشارع / التقاطع)</th>
                    <th className="p-3 text-center">عدد الأخطاء المرصودة</th>
                    <th className="p-3 text-center">النسبة المئوية من إجمالي الأخطاء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.cameraLocationsStats?.map((loc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                        <span>{loc.location}</span>
                      </td>
                      <td className="p-3 text-center font-black text-rose-700">{loc.count}</td>
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-brand-600 h-2 rounded-full" style={{ width: `${Math.min(100, loc.percentage * 2)}%` }}></div>
                          </div>
                          <span className="font-bold text-slate-700">{loc.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* الجداول التفصيلية للأدوار الأربعة */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* جدول المستخرجين */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 printable-area">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h4 className="font-black text-sm text-blue-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span>إحصائية المستخرجين (أمانة عمّان)</span>
                </h4>
                <span className="text-xs font-bold text-slate-500">
                  {stats.extractorsStats.length} مستخرج
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-2.5">رقم الموظف</th>
                      <th className="p-2.5">الاسم</th>
                      <th className="p-2.5 text-center">عدد الأخطاء</th>
                      <th className="p-2.5 text-center">النسبة %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.extractorsStats.map((item) => (
                      <tr key={item.number} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{item.number}</td>
                        <td className="p-2.5 font-semibold text-slate-700">{item.name}</td>
                        <td className="p-2.5 text-center font-black text-blue-700">{item.count}</td>
                        <td className="p-2.5 text-center font-medium text-slate-500">{item.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* جدول المدققين */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 printable-area">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h4 className="font-black text-sm text-sky-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                  <span>إحصائية المدققين</span>
                </h4>
                <span className="text-xs font-bold text-slate-500">
                  {stats.auditorsStats.length} مدقق
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-2.5">رقم الموظف</th>
                      <th className="p-2.5">الاسم</th>
                      <th className="p-2.5 text-center">عدد التدقيقات</th>
                      <th className="p-2.5 text-center">النسبة %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.auditorsStats.map((item) => (
                      <tr key={item.number} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{item.number}</td>
                        <td className="p-2.5 font-semibold text-slate-700">{item.name}</td>
                        <td className="p-2.5 text-center font-black text-sky-700">{item.count}</td>
                        <td className="p-2.5 text-center font-medium text-slate-500">{item.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* جدول المعدلين */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 printable-area">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h4 className="font-black text-sm text-teal-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                  <span>إحصائية المعدلين</span>
                </h4>
                <span className="text-xs font-bold text-slate-500">
                  {stats.modifiersStats.length} معدل
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-2.5">رقم الموظف</th>
                      <th className="p-2.5">الاسم</th>
                      <th className="p-2.5 text-center">عدد التعديلات</th>
                      <th className="p-2.5 text-center">النسبة %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.modifiersStats.map((item) => (
                      <tr key={item.number} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{item.number}</td>
                        <td className="p-2.5 font-semibold text-slate-700">{item.name}</td>
                        <td className="p-2.5 text-center font-black text-teal-700">{item.count}</td>
                        <td className="p-2.5 text-center font-medium text-slate-500">{item.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* جدول المبلغين */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 printable-area">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h4 className="font-black text-sm text-rose-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  <span>إحصائية المبلغين</span>
                </h4>
                <span className="text-xs font-bold text-slate-500">
                  {stats.reportersStats.length} مبلغ
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-2.5">رقم الموظف</th>
                      <th className="p-2.5">الاسم</th>
                      <th className="p-2.5 text-center">عدد البلاغات</th>
                      <th className="p-2.5 text-center">النسبة %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.reportersStats.map((item) => (
                      <tr key={item.number} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{item.number}</td>
                        <td className="p-2.5 font-semibold text-slate-700">{item.name}</td>
                        <td className="p-2.5 text-center font-black text-rose-700">{item.count}</td>
                        <td className="p-2.5 text-center font-medium text-slate-500">{item.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
