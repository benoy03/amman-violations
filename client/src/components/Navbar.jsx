import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  LogOut,
  ShieldCheck,
  Camera,
  History
} from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'تسجيل مخالفة', icon: FilePlus },
    { to: '/violations', label: 'سجل المخالفات', icon: Table },
    { to: '/sheet/extractor', label: 'صفحة المستخرجين', icon: Search },
    { to: '/sheet/auditor', label: 'صفحة المدققين', icon: UserCheck },
    { to: '/sheet/modifier', label: 'صفحة المعدلين', icon: FileEdit },
    { to: '/sheet/reporter', label: 'صفحة المبلغين', icon: Radio },
    { to: '/reports', label: 'التقارير والإحصائيات', icon: BarChart3 },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin/employees', label: 'إدارة الموظفين', icon: Users });
    navItems.push({ to: '/admin/audit', label: 'سجل الرقابة والعمليات', icon: History });
  }

  return (
    <header className="no-print bg-gradient-to-r from-brand-950 via-brand-900 to-slate-900 text-white shadow-xl border-b border-brand-800/60 sticky top-0 z-50">
      {/* الشريط العلوي للترويسة */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-white/10">
          {/* شعار وعنوان النظام */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-brand-500/20 p-2.5 rounded-xl border border-brand-400/30 flex items-center justify-center text-brand-300">
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-wide text-white">
                  أمانة عمّان الكبرى
                </h1>
                <span className="bg-brand-500/30 text-brand-200 border border-brand-400/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  قسم المخالفات
                </span>
              </div>
              <p className="text-xs text-brand-200/80 font-medium">
                نظام كشف وتعديل مخالفات الكاميرات الرقابية — الأردن
              </p>
            </div>
          </div>

          {/* معلومات المستخدم وتسجيل الخروج */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="hidden md:flex flex-col text-left text-xs">
              <span className="font-semibold text-slate-100">{user?.full_name || user?.username}</span>
              <span className="text-brand-300 flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isAdmin ? 'مدير النظام' : 'موظف الرقابة'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold transition-all duration-150"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>

        {/* شريط التنقل والروابط الرئيسية */}
        <nav className="flex items-center space-x-1 space-x-reverse overflow-x-auto py-2.5 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30 border border-brand-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
