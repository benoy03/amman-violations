import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('aml_sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('aml_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  // Ctrl+B shortcut
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setCollapsed((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{
        background: 'linear-gradient(135deg, #f0f4f8 0%, #eaf0f7 50%, #f0f4f8 100%)',
      }}
    >
      {/* الشريط الجانبي */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* منطقة العمل الرئيسية */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen ${
          collapsed ? 'lg:mr-[72px]' : 'lg:mr-72'
        }`}
      >
        {/* الشريط العلوي */}
        <TopBar onOpenMobile={() => setMobileOpen(true)} />

        {/* محتوى الصفحة */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>

        {/* التذييل الرسمي */}
        <footer
          className="no-print px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
          style={{
            borderTop: '1px solid rgba(15,23,42,0.06)',
            background: 'rgba(255,255,255,0.7)',
          }}
        >
          <p className="font-bold text-slate-500">
            نظام كشف وتعديل مخالفات الكاميرات الرقابية &copy; {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="font-semibold">
              أمانة عمّان الكبرى — مديرية الرقابة الآلية والتحكم
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
