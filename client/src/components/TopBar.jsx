import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';
import {
  Menu,
  Clock,
  LogOut,
  KeyRound,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  Building2,
  Bell,
  Wifi,
} from 'lucide-react';

const ROUTE_META = {
  '/': { name: 'تسجيل مخالفة جديدة', color: 'blue' },
  '/violations': { name: 'سجل المخالفات العام', color: 'slate' },
  '/sheet/extractor': { name: 'كشف المستخرجين', color: 'indigo' },
  '/sheet/auditor': { name: 'كشف المدققين', color: 'sky' },
  '/sheet/modifier': { name: 'كشف المعدلين', color: 'teal' },
  '/sheet/reporter': { name: 'كشف المبلغين', color: 'rose' },
  '/reports': { name: 'التقارير والمؤشرات التحليلية', color: 'purple' },
  '/admin/employees': { name: 'إدارة الكوادر ومواقع الكاميرات', color: 'amber' },
  '/admin/audit': { name: 'سجل الرقابة والعمليات', color: 'slate' },
};

function LiveClock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    function update() {
      const now = new Date();
      setTime(now.toLocaleTimeString('ar-JO', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      }));
      setDate(now.toLocaleDateString('ar-JO', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
      }));
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl border border-slate-200/80 bg-slate-50 text-xs font-bold text-slate-700">
      <div className="flex items-center gap-1.5 text-brand-700">
        <Clock className="w-3.5 h-3.5 animate-spin-slow text-brand-500 flex-shrink-0" />
        <span className="font-mono tracking-wide tabular-nums">{time || '00:00:00'}</span>
      </div>
      <span className="text-slate-300">|</span>
      <span className="text-slate-600 font-semibold">{date}</span>
    </div>
  );
}

export default function TopBar({ onOpenMobile }) {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const profileRef = useRef(null);

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

  const routeMeta = ROUTE_META[location.pathname] || { name: 'النظام', color: 'slate' };

  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 no-print"
        style={{
          height: '72px',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
        }}
      >
        {/* الجانب الأيمن: فتح الموبايل + Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* زر القائمة على الموبايل */}
          <button
            onClick={onOpenMobile}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}
            title="فتح القائمة"
          >
            <Menu className="w-4.5 h-4.5 text-slate-600" style={{ width: '18px', height: '18px' }} />
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-extrabold"
              style={{
                background: 'rgba(38,104,229,0.08)',
                border: '1px solid rgba(38,104,229,0.12)',
                color: '#1d52d2',
              }}>
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">أمانة عمّان</span>
            </div>

            <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />

            <div className="flex items-center gap-2">
              <span className="font-black text-slate-800 text-xs sm:text-sm">
                {routeMeta.name}
              </span>
            </div>
          </nav>
        </div>

        {/* الجانب الأيسر: الساعة + الإشعارات + المستخدم */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* مؤشر الاتصال */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-emerald-700"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <Wifi className="w-3 h-3" />
            <span>متصل</span>
          </div>

          {/* الساعة اللحظية */}
          <LiveClock />

          {/* زر الإشعارات */}
          <button className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:bg-slate-100"
            style={{ border: '1px solid #e2e8f0' }}>
            <Bell className="w-4 h-4 text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
          </button>

          {/* قائمة المستخدم */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 py-1.5 px-2 sm:px-3 rounded-2xl transition-all duration-200 hover:bg-slate-50"
              style={{ border: '1px solid transparent' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#e2e8f0'}
              onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.borderColor = 'transparent'; }}
            >
              {/* أفاتار المستخدم */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #2668e5 0%, #0f2942 100%)' }}
              >
                {user?.full_name ? user.full_name.charAt(0) : 'م'}
              </div>

              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-black text-slate-800 max-w-[120px] truncate leading-tight">
                  {user?.full_name || user?.username}
                </span>
                <span className="text-[10px] font-bold text-brand-600 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {isAdmin ? 'مدير النظام' : 'موظف تدقيق'}
                </span>
              </div>

              <ChevronDown
                className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block"
                style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>

            {/* القائمة المنسدلة */}
            {profileOpen && (
              <div
                className="absolute left-0 mt-2 w-72 rounded-2xl overflow-hidden z-50 animate-slide-down"
                style={{
                  background: 'rgba(255,255,255,0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(15,23,42,0.08)',
                  boxShadow: '0 20px 40px -8px rgba(0,0,0,0.15), 0 8px 16px -4px rgba(0,0,0,0.08)',
                }}
              >
                {/* معلومات المستخدم */}
                <div className="p-4" style={{ borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #2668e5 0%, #0f2942 100%)' }}
                    >
                      {user?.full_name ? user.full_name.charAt(0) : 'م'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">{user?.full_name || user?.username}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        @{user?.username}
                      </p>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold"
                        style={{
                          background: isAdmin ? 'rgba(38,104,229,0.08)' : 'rgba(16,185,129,0.08)',
                          border: isAdmin ? '1px solid rgba(38,104,229,0.15)' : '1px solid rgba(16,185,129,0.15)',
                          color: isAdmin ? '#1d52d2' : '#059669',
                        }}>
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>{isAdmin ? 'صلاحية كاملة — مدير' : 'صلاحية موظف'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* عناصر القائمة */}
                <div className="p-2">
                  <button
                    onClick={() => { setProfileOpen(false); setPasswordModalOpen(true); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 transition-all duration-150"
                    onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#2668e5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 text-slate-500">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <span>تغيير كلمة المرور</span>
                  </button>

                  <div className="my-1.5" style={{ borderTop: '1px solid rgba(15,23,42,0.06)' }} />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150"
                    style={{ color: '#dc2626' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.08)' }}>
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <span>تسجيل الخروج من النظام</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </>
  );
}
