import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function PrintHeader({ title, subtitle }) {
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('ar-JO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="print-only mb-6 border-b-2 border-slate-800 pb-4 text-slate-900">
      <div className="flex justify-between items-start">
        <div className="text-right">
          <p className="font-bold text-sm">المملكة الأردنية الهاشمية</p>
          <p className="font-bold text-sm">أمانة عمّان الكبرى</p>
          <p className="text-xs text-slate-600">مديرية الرقابة الآلية والتحكم — قسم المخالفات</p>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black">{title || 'كشف تعديل مخالفات الكاميرات'}</h1>
          {subtitle && <p className="text-sm font-semibold text-slate-700 mt-1">{subtitle}</p>}
        </div>
        <div className="text-left text-xs text-slate-600">
          <p>تاريخ ووقت الطباعة: {currentDate}</p>
          <p>الموظف المسؤول: {user?.full_name || user?.username || 'النظام'}</p>
        </div>
      </div>
    </div>
  );
}
