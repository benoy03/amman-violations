import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('aml_sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('aml_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  // اختصار لوحة المفاتيح Ctrl + B لتوسيع/تصغير القائمة الجانبية
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

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col antialiased selection:bg-brand-600 selection:text-white">
      {/* الشريط الجانبي القابل للطي */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* منطقة العمل الرئيسية المتجاوبة مع الشريط الجانبي */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:mr-20' : 'lg:mr-72'
        }`}
      >
        {/* الشريط العلوي للـ ERP */}
        <TopBar onOpenMobile={() => setMobileOpen(true)} />

        {/* مساحة الصفحات والمحتوى */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* التذييل الرسمي */}
        <footer className="no-print bg-white/70 backdrop-blur-sm border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-bold">
            نظام كشف وتعديل مخالفات الكاميرات الرقابية &copy; {new Date().getFullYear()}
          </p>
          <p className="text-[11px] font-semibold text-slate-400">
            أمانة عمّان الكبرى — مديرية الرقابة الآلية والتحكم (قسم المخالفات)
          </p>
        </footer>
      </div>
    </div>
  );
}
