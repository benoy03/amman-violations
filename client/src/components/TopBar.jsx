import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import {
  Menu,
  Clock,
  Calendar,
  LogOut,
  KeyRound,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  MapPin,
  Building2,
  FilePlus,
  Table,
  Search
} from 'lucide-react';

const ROUTE_NAMES = {
  '/': 'تسجيل مخالفة جديدة',
  '/violations': 'سجل المخالفات العام',
  '/sheet/extractor': 'كشف المستخرجين',
  '/sheet/auditor': 'كشف المدققين',
  '/sheet/modifier': 'كشف المعدلين',
  '/sheet/reporter': 'كشف المبلغين',
  '/reports': 'التقارير والمؤشرات التحليلية',
  '/admin/employees': 'إدارة الكوادر ومواقع الكاميرات',
  '/admin/audit': 'سجل الرقابة والعمليات'
};

export default function TopBar({ onOpenMobile }) {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const profileRef = useRef(null);

  // تحديث الساعة اللحظية بتوقيت المملكة الأردنية الهاشمية
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('ar-JO', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
      setCurrentDate(
        now.toLocaleDateString('ar-JO', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentTitle = ROUTE_NAMES[location.pathname] || 'النظام';

  return (
    <>
      <header className="sticky top-0 z-30 h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-sm no-print">
        {/* الجانب الأيمن: زر الهواتف ومسار التصفح (Breadcrumbs) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="فتح القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-brand-700 font-extrabold bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">أمانة عمّان الكبرى</span>
              <span className="sm:hidden">أمانة عمّان</span>
            </div>

            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />

            <span className="font-black text-slate-800 text-xs sm:text-sm">
              {currentTitle}
            </span>
          </nav>
        </div>

        {/* الجانب الأيسر: الساعة الرسمية وقائمة المستخدم */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* ساعة وتاريخ النظام اللحظي */}
          <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-inner">
            <div className="flex items-center gap-1.5 text-brand-700">
              <Clock className="w-4 h-4 animate-spin-slow text-brand-600" />
              <span className="font-mono tracking-wider">{currentTime || '--:--:--'}</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1 text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentDate}</span>
            </div>
          </div>

          {/* قائمة المستخدم الشخصية المنسدلة */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-slate-900 text-white flex items-center justify-center font-black text-xs shadow-md">
                {user?.full_name ? user.full_name.charAt(0) : 'م'}
              </div>

              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-black text-slate-800 truncate max-w-[130px]">
                  {user?.full_name || user?.username}
                </span>
                <span className="text-[10px] text-brand-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {isAdmin ? 'مدير النظام' : 'موظف تدقيق'}
                </span>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-400 transition-transform" />
            </button>

            {/* القائمة المنسدلة */}
            {profileOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-black text-slate-900">{user?.full_name || user?.username}</p>
                  <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                    اسم الدخول: <span className="font-mono text-slate-700">{user?.username}</span>
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-brand-50 text-brand-700 rounded-lg text-[10px] font-extrabold border border-brand-100">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{isAdmin ? 'صلاحية كاملة (مدير النظام)' : 'صلاحية إدخال وتدقيق'}</span>
                  </div>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setPasswordModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded-xl transition"
                  >
                    <KeyRound className="w-4 h-4 text-slate-400" />
                    <span>تغيير كلمة المرور</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>تسجيل الخروج من النظام</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* نافذة تغيير كلمة المرور */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </>
  );
}
