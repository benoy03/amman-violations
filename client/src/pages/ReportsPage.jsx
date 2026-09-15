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
  CheckCircle2,
  MapPin,
  PieChart as PieIcon,
  Building2,
  Filter,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  Activity,
  Layers,
  Flame,
  Award
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
  const [jurisdiction, setJurisdiction] = useState('الكل');
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
          jurisdiction: jurisdiction !== 'الكل' ? jurisdiction : undefined,
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
  }, [period, jurisdiction]);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customStart && customEnd) {
      fetchStats();
    }
  };

  const chartColors = ['#2563eb', '#0284c7', '#0d9488', '#e11d48'];
  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

  return (
    <div className="space-y-6">
      {/* ترويسة الطباعة الرسمية */}
      <PrintHeader
        title="تقرير وإحصائيات تعديل مخالفات الكاميرات الرقابية"
        subtitle={`أمانة عمّان الكبرى — الفترة: ${stats?.dateRange?.label || period} (${stats?.dateRange?.startDate} إلى ${stats?.dateRange?.endDate}) — الاختصاص: ${jurisdiction === 'الكل' ? 'جميع الاختصاصات' : jurisdiction}`}
      />

      {/* الرأس وعناصر التحكم في الشاشة */}
      <div className="no-print bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black text-brand-700 bg-brand-50/80 border border-brand-200/60 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-brand-600" />
              <span>أمانة عمّان الكبرى</span>
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-xl border border-slate-200/60 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              <span>لوحة المؤشرات والتحليلات التنفيذية</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            التقارير والإحصائيات الدورية
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            تحليل شامل ومؤشرات أداء دقيقة لعمليات تدقيق الكاميرات، ومعدلات الأخطاء على مستوى شوارع ومناطق العاصمة
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-black hover:to-slate-950 text-white text-xs font-black shadow-lg shadow-slate-900/20 hover:shadow-xl transition border border-slate-700 w-full md:w-auto transform active:scale-95"
          >
            <Printer className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <span>طباعة التقرير أو تصدير PDF</span>
          </button>
        </div>
      </div>

      {/* شريط الفلاتر والتحكم الزمني */}
      <div className="no-print bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        {/* اختيار الفترة الزمنية */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-extrabold text-slate-800">
              اختر الفترة الزمنية:
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  period === p.id
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* اختيار الاختصاص */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-extrabold text-slate-800">
              اختصاص المخالفة:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'الكل', label: 'جميع الاختصاصات', color: 'bg-slate-900' },
              { id: 'سير', label: '🚦 اختصاص سير', color: 'bg-blue-600' },
              { id: 'دوريات خارجية', label: '🚓 دوريات خارجية', color: 'bg-purple-600' }
            ].map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => setJurisdiction(j.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  jurisdiction === j.id
                    ? `${j.color} text-white shadow-md`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {j.label}
              </button>
            ))}
          </div>
        </div>

        {/* المدى المخصص من/إلى */}
        {period === 'custom' && (
          <form
            onSubmit={handleCustomSubmit}
            className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 animate-in fade-in"
          >
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-extrabold text-slate-600 uppercase">من تاريخ:</label>
              <input
                type="date"
                required
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-extrabold text-slate-600 uppercase">إلى تاريخ:</label>
              <input
                type="date"
                required
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs rounded-xl shadow-md transition"
            >
              تطبيق التقرير
            </button>
          </form>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-400 font-bold border border-slate-200/80 shadow-sm flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <span className="text-sm font-black text-slate-700">جاري استخراج وتجميع الإحصائيات...</span>
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* بطاقات المؤشرات العامة (KPIs) */}
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
              title="أعلى موقع كاميرا أخطاء"
              value={stats.summary.topCameraHotspot?.count || 0}
              subtext={stats.summary.topCameraHotspot?.location || 'لا توجد بيانات'}
              icon={MapPin}
              color="red"
            />
            <StatCard
              title="أعلى معدل أخطاء موظف"
              value={stats.summary.topModifier?.count || 0}
              subtext={stats.summary.topModifier?.name || 'لا توجد بيانات'}
              icon={CheckCircle2}
              color="teal"
            />
          </div>

          {/* لوحة مقارنة الاختصاص: سير مقابل دوريات خارجية */}
          {stats.jurisdictionStats && stats.jurisdictionStats.length > 0 && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-slate-700/80 printable-area relative overflow-hidden">
              <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-base font-black flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>مقارنة اختصاص المخالفات في الفترة</span>
                    <span className="text-xs font-normal text-slate-300">({stats.dateRange?.label})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    التوزيع الإحصائي بين اختصاص إدارة السير وإدارة الدوريات الخارجية
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-3.5 py-1.5 bg-white/10 border border-white/10 rounded-xl font-black text-slate-200 shadow-sm">
                    إجمالي الفترة: {stats.summary.totalViolationsInPeriod} مخالفة
                  </span>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(() => {
                  const traffic = stats.jurisdictionStats.find((j) => j.jurisdiction === 'سير') || { count: 0, percentage: 0 };
                  const patrol = stats.jurisdictionStats.find((j) => j.jurisdiction === 'دوريات خارجية') || { count: 0, percentage: 0 };
                  return (
                    <>
                      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4.5 flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-2xl">
                            🚦
                          </div>
                          <div>
                            <div className="text-xs font-bold text-blue-300">اختصاص سير</div>
                            <div className="text-2xl font-black text-white mt-0.5">
                              {traffic.count} <span className="text-xs font-normal text-slate-300">مخالفة</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-amber-300">{traffic.percentage}%</div>
                          <div className="w-28 bg-white/10 rounded-full h-2 mt-1.5 overflow-hidden">
                            <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${traffic.percentage}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4.5 flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-2xl">
                            🚓
                          </div>
                          <div>
                            <div className="text-xs font-bold text-purple-300">اختصاص دوريات خارجية</div>
                            <div className="text-2xl font-black text-white mt-0.5">
                              {patrol.count} <span className="text-xs font-normal text-slate-300">مخالفة</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-emerald-400">{patrol.percentage}%</div>
                          <div className="w-28 bg-white/10 rounded-full h-2 mt-1.5 overflow-hidden">
                            <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${patrol.percentage}%` }} />
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* قسم الرسوم البيانية التفاعلية (Bar Chart + Donut Chart) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* الرسم البياني المقارن للأدوار الأربعة */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 printable-area">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-brand-600" />
                    <span>مقارنة إجمالي العمليات بين أدوار العمل الأربعة</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    المستخرجون مقابل المدققين والمعدلين والمبلغين لنفس الفترة ({stats.dateRange?.label})
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.comparisonSeries} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="role" tick={{ fill: '#334155', fontSize: 12, fontWeight: 'bold' }} axisLine={{ stroke: '#e2e8f0' }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} />
                    <Tooltip
                      formatter={(val) => [`${val} عملية / خطأ`, 'العدد']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        borderRadius: '16px',
                        border: 'none',
                        fontSize: '12px',
                        direction: 'rtl',
                        textAlign: 'right',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                      }}
                    />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={64}>
                      {stats.comparisonSeries.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* الرسم الدائري لتوزيع طبيعة الأخطاء */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 printable-area">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
                <PieIcon className="w-5 h-5 text-indigo-600" />
                <span>توزيع نسب طبيعة الأخطاء</span>
              </h3>
              <div className="h-60 w-full">
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
              <div className="space-y-1.5 mt-2 text-[11px] max-h-28 overflow-y-auto pr-1">
                {stats.errorTypesStats.map((e, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-600 hover:text-slate-900 transition">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: pieColors[idx % pieColors.length] }} />
                      <span className="truncate">{e.error_type}</span>
                    </span>
                    <span className="font-bold font-mono text-slate-800">{e.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* تحليل مواقع كاميرات عمّان الأكثر أخطاء */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 printable-area">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900">مواقع الكاميرات الأكثر تسجيلاً للأخطاء في عمّان</h4>
                  <span className="text-[11px] font-semibold text-slate-400">نقاط الرقابة البؤرية حسب عدد الحالات المرصودة</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>{stats.cameraLocationsStats?.length || 0} موقع نشط</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200/80">
                    <th className="p-3">موقع الكاميرا (الشارع / التقاطع)</th>
                    <th className="p-3 text-center">رمز الموقع</th>
                    <th className="p-3 text-center">عدد الأخطاء</th>
                    <th className="p-3 text-center">النسبة المئوية من الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.cameraLocationsStats?.map((loc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                        <span>{loc.location}</span>
                      </td>
                      <td className="p-3 text-center">
                        {loc.code ? (
                          <span className="text-xs font-mono font-black bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-lg border border-amber-200">
                            {loc.code}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-black text-rose-600">{loc.count}</td>
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-2.5">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                            <div
                              className="bg-gradient-to-r from-brand-600 to-rose-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, loc.percentage * 2.5)}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700 font-mono">{loc.percentage}%</span>
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
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 printable-area">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                    م
                  </div>
                  <h4 className="font-black text-sm text-slate-900">إحصائية المستخرجين</h4>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {stats.extractorsStats.length} موظف
                </span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200/80">
                      <th className="p-2.5">الرقم</th>
                      <th className="p-2.5">الاسم الكامل</th>
                      <th className="p-2.5 text-center">العدد</th>
                      <th className="p-2.5 text-center">النسبة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.extractorsStats.map((item) => (
                      <tr key={item.number} className="hover:bg-slate-50/80 transition">
                        <td className="p-2.5 font-mono font-bold text-slate-900">{item.number}</td>
                        <td className="p-2.5 font-bold text-slate-800">{item.name}</td>
                        <td className="p-2.5 text-center font-black text-blue-700">{item.count}</td>
                        <td className="p-2.5 text-center font-bold text-slate-600">{item.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* جدول المدققين */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 printable-area">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-black text-xs">
                    د
                  </div>
                  <h4 className="font-black text-sm text-slate-900">إحصائية المدققين</h4>
                </div>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                  {stats.auditorsStats.length} مدقق
                </span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200/80">
                      <th className="p-2.5">الرقم</th>
                      <th className="p-2.5">الاسم الكامل</th>
                      <th className="p-2.5 text-center">العدد</th>
                      <th className="p-2.5 text-center">النسبة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.auditorsStats.map((item) => (
                      <tr key={item.number} className="hover:bg-slate-50/80 transition">
                        <td className="p-2.5 font-mono font-bold text-slate-900">{item.number}</td>
                        <td className="p-2.5 font-bold text-slate-800">{item.name}</td>
                        <td className="p-2.5 text-center font-black text-sky-700">{item.count}</td>
                        <td className="p-2.5 text-center font-bold text-slate-600">{item.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* جدول المعدلين */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 printable-area">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xs">
                    ع
                  </div>
                  <h4 className="font-black text-sm text-slate-900">إحصائية المعدلين</h4>
                </div>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                  {stats.modifiersStats.length} معدل
                </span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200/80">
                      <th className="p-2.5">الرقم</th>
                      <th className="p-2.5">الاسم الكامل</th>
                      <th className="p-2.5 text-center">العدد</th>
                      <th className="p-2.5 text-center">النسبة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.modifiersStats.map((item) => (
                      <tr key={item.number} className="hover:bg-slate-50/80 transition">
                        <td className="p-2.5 font-mono font-bold text-slate-900">{item.number}</td>
                        <td className="p-2.5 font-bold text-slate-800">{item.name}</td>
                        <td className="p-2.5 text-center font-black text-teal-700">{item.count}</td>
                        <td className="p-2.5 text-center font-bold text-slate-600">{item.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* جدول المبلغين */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 printable-area">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-black text-xs">
                    ب
                  </div>
                  <h4 className="font-black text-sm text-slate-900">إحصائية المبلغين</h4>
                </div>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                  {stats.reportersStats.length} مبلغ
                </span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200/80">
                      <th className="p-2.5">الرقم</th>
                      <th className="p-2.5">الاسم الكامل</th>
                      <th className="p-2.5 text-center">العدد</th>
                      <th className="p-2.5 text-center">النسبة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.reportersStats.map((item) => (
                      <tr key={item.number} className="hover:bg-slate-50/80 transition">
                        <td className="p-2.5 font-mono font-bold text-slate-900">{item.number}</td>
                        <td className="p-2.5 font-bold text-slate-800">{item.name}</td>
                        <td className="p-2.5 text-center font-black text-rose-700">{item.count}</td>
                        <td className="p-2.5 text-center font-bold text-slate-600">{item.percentage}%</td>
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
