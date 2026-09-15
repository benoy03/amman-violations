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
  Zap,
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, isAdmin } = useAuth();

  const navSections = [
    {
      title: 'العمليات التشغيلية',
      items: [
        { to: '/', label: 'تسجيل مخالفة', icon: FilePlus, badge: 'إدخال', badgeColor: 'blue' },
        { to: '/violations', label: 'سجل المخالفات', icon: Table, badge: 'شامل', badgeColor: 'slate' }
      ]
    },
    {
      title: 'كشوفات الوردية',
      items: [
        { to: '/sheet/extractor', label: 'كشف المستخرجين', icon: Search },
        { to: '/sheet/auditor', label: 'كشف المدققين', icon: UserCheck },
        { to: '/sheet/modifier', label: 'كشف المعدلين', icon: FileEdit },
        { to: '/sheet/reporter', label: 'كشف المبلغين', icon: Radio }
      ]
    },
    {
      title: 'التحليلات',
      items: [
        { to: '/reports', label: 'المؤشرات والتقارير', icon: BarChart3 }
      ]
    }
  ];

  if (isAdmin) {
    navSections.push({
      title: 'إدارة النظام',
      items: [
        { to: '/admin/employees', label: 'الكوادر والمواقع', icon: Users, badge: 'أدمن', badgeColor: 'amber' },
        { to: '/admin/audit', label: 'سجل العمليات', icon: History, badge: 'Audit', badgeColor: 'purple' }
      ]
    });
  }

  const badgeColors = {
    blue: 'bg-brand-900/60 text-brand-300 border-brand-800/60',
    slate: 'bg-slate-900/60 text-slate-400 border-slate-800/60',
    amber: 'bg-amber-900/40 text-amber-300 border-amber-800/40',
    purple: 'bg-purple-900/40 text-purple-300 border-purple-800/40',
  };

  const closeMobile = () => {
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* خلفية معتمة للهواتف */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 lg:hidden touch-none"
          style={{ background: 'rgba(2, 6, 23, 0.7)', backdropFilter: 'blur(4px)' }}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 flex flex-col transition-all duration-300 ease-in-out no-print ${
          collapsed ? 'w-[72px]' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: 'linear-gradient(180deg, #080f20 0%, #060c18 60%, #05090f 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* ترويسة الشريط الجانبي */}
        <div
          className="flex items-center justify-between px-4 border-b flex-shrink-0"
          style={{
            height: '64px',
            borderColor: 'rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
            {/* شعار النظام */}
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
              style={{
                background: 'linear-gradient(135deg, rgba(38,104,229,0.5) 0%, rgba(29,82,210,0.3) 100%)',
                border: '1px solid rgba(38,104,229,0.3)',
              }}
            >
              <Camera className="w-5 h-5 text-brand-300" />
              {/* نبضة الاتصال */}
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 flex">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>

            {!collapsed && (
              <div className="min-w-0 animate-fade-in">
                <p className="text-[13px] font-black text-white leading-tight tracking-tight">
                  أمانة عمّان الكبرى
                </p>
                <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">
                  قسم المخالفات والرقابة
                </p>
              </div>
            )}
          </div>

          {/* زر الطي - شاشات كبيرة */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 flex-shrink-0 ${collapsed ? 'w-full justify-center mt-2' : ''}`}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.4)',
            }}
            title={collapsed ? 'توسيع (Ctrl+B)' : 'تصغير (Ctrl+B)'}
          >
            {collapsed
              ? <ChevronLeft className="w-3.5 h-3.5" />
              : <ChevronRight className="w-3.5 h-3.5" />
            }
          </button>
        </div>

        {/* قائمة التنقل */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5" style={{ scrollbarWidth: 'none' }}>
          {navSections.map((sec, idx) => (
            <div key={idx}>
              {!collapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest mb-2"
                  style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {sec.title}
                </p>
              )}
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={closeMobile}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                          collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'
                        } ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-500 hover:text-slate-200'
                        }`
                      }
                      style={({ isActive }) => isActive ? {
                        background: 'linear-gradient(135deg, rgba(38,104,229,0.3) 0%, rgba(29,82,210,0.2) 100%)',
                        border: '1px solid rgba(38,104,229,0.25)',
                        boxShadow: '0 0 12px rgba(38,104,229,0.15)',
                      } : {
                        background: 'transparent',
                        border: '1px solid transparent',
                      }}
                    >
                      {({ isActive }) => (
                        <>
                          {/* Indicator line on right for active */}
                          {isActive && !collapsed && (
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-4/5 rounded-full"
                              style={{ background: 'linear-gradient(180deg, #3b86f0, #2668e5)' }} />
                          )}
                          <div
                            className={`flex items-center justify-center flex-shrink-0 rounded-xl transition-all duration-200 ${
                              collapsed ? 'w-10 h-10' : 'w-7 h-7'
                            }`}
                            style={isActive ? {
                              background: 'rgba(38,104,229,0.3)',
                              color: '#93c5fd',
                            } : {
                              background: 'rgba(255,255,255,0.05)',
                              color: 'rgba(255,255,255,0.4)',
                            }}
                          >
                            <Icon className={`transition-transform group-hover:scale-110 ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                          </div>

                          {!collapsed && (
                            <div className="flex-1 flex items-center justify-between min-w-0">
                              <span className="truncate">{item.label}</span>
                              {item.badge && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded-lg border font-black flex-shrink-0 ${
                                    badgeColors[item.badgeColor] || badgeColors.slate
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Tooltip for collapsed mode */}
                          {collapsed && (
                            <div
                              className="absolute right-full mr-3 px-3 py-1.5 rounded-xl text-xs font-bold text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50"
                              style={{
                                background: 'rgba(15,23,42,0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                              }}
                            >
                              {item.label}
                              <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rotate-45"
                                style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: 'none', borderBottom: 'none' }} />
                            </div>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* بطاقة المستخدم أسفل الشريط */}
        <div
          className="p-3 flex-shrink-0"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <div className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all ${collapsed ? 'justify-center' : ''}`}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {/* صورة المستخدم */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md text-white"
              style={{ background: 'linear-gradient(135deg, #2668e5, #1e43ab)' }}
            >
              {user?.full_name ? user.full_name.charAt(0) : 'م'}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-white truncate leading-tight">
                  {user?.full_name || user?.username}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-brand-400 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-slate-500 truncate">
                    {isAdmin ? 'مدير النظام' : 'موظف رقابة'}
                  </span>
                </div>
              </div>
            )}

            {!collapsed && (
              <Zap className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 animate-pulse" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
