import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <footer className="no-print bg-slate-900 text-slate-400 text-center py-4 text-xs border-t border-slate-800">
        <p>
          نظام كشف تعديل مخالفات الكاميرات — أمانة عمّان الكبرى (المملكة الأردنية الهاشمية) &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
