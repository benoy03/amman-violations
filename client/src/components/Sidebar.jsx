import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FilePlus,
  Table,
  Search,
  UserCheck,
  FileEdit,
  Radio,
  BarChart3,
  Users,
  History,
  Camera,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  Building2
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, isAdmin } = useAuth();

  const navSections = [
    {
      title: 'العمليات التشغيلية',
      items: [
        { to: '/', label: 'تسجيل مخالفة جديدة', icon: FilePlus, badge: 'إدخال' },
        { to: '/violations', label: 'سجل المخالفات العام', icon: Table, badge: 'شامل' }
      ]
    },
    {
      title: 'كشوفات الوردية والتدقيق',
      items: [
        { to: '/sheet/extractor', label: 'كشف المستخرجين', icon: Search },
        { to: '/sheet/auditor', label: 'كشف المدققين', icon: UserCheck },
        { to: '/sheet/modifier', label: 'كشف المعدلين', icon: FileEdit },
        { to: '/sheet/reporter', label: 'كشف المبلغين', icon: Radio }
      ]
    },
    {
      title: 'التحليلات والمؤشرات',
      items: [
        { to: '/reports', label: 'المؤشرات والتقارير', icon: BarChart3 }
      ]
    }
  ];

  if (isAdmin) {
    navSections.push({
      title: 'إدارة النظام والرقابة',
      items: [
        { to: '/admin/employees', label: 'إدارة الكوادر والمواقع', icon: Users, badge: 'مدير' },
        { to: '/admin/audit', label: 'سجل العمليات والتدقيق', icon: History, badge: 'Audit' }
      ]
    });
  }

  const closeMobile = () => {
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* خلفية معتمة للهواتف */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 right-0 z-40 flex flex-col bg-slate-950 text-white border-l border-slate-800 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } shadow-2xl no-print`}
      >
        {/* الترويسة العلوية للـ Sidebar */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 p-0.5 shadow-lg shadow-brand-500/20 flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-brand-400">
                <Camera className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            {!collapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white tracking-tight">أمانة عمّان الكبرى</span>
                </div>
                <p className="text-[11px] font-bold text-brand-400 truncate">
                  قسم المخالفات والرقابة الآلية
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] text-slate-400 font-bold">النظام متصل</span>
                </div>
              </div>
            )}
          </div>

          {/* زر طي الـ Sidebar على الشاشات الكبيرة */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 hover:bg-brand-900/60 border border-slate-800 text-slate-400 hover:text-white transition"
            title={collapsed ? 'توسيع القائمة (Ctrl+B)' : 'تصغير القائمة (Ctrl+B)'}
          >
            {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* قائمة الروابط المصنفة */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1.5">
              {!collapsed && (
                <p className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  {sec.title}
                </p>
              )}
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 relative ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                        } ${collapsed ? 'justify-center' : ''}`
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />

                      {!collapsed && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-brand-300 font-bold">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* بطاقة المستخدم السريعة أسفل الشريط الجانبي */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
          <div className={`flex items-center gap-3 p-2 rounded-2xl bg-slate-900 border border-slate-800/80 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow-md">
              {user?.full_name ? user.full_name.charAt(0) : 'أ'}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-white truncate">
                  {user?.full_name || user?.username}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-brand-300 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                  <span>{isAdmin ? 'مدير النظام' : 'موظف رقابة'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
