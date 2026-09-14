import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    teal: 'bg-teal-50 text-teal-600 border-teal-200',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-rose-50 text-rose-600 border-rose-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    brand: 'bg-brand-50 text-brand-600 border-brand-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const badgeClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">{title}</p>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{value ?? '—'}</p>
        {subtext && <p className="text-xs font-semibold text-slate-500 mt-1 truncate" title={subtext}>{subtext}</p>}
      </div>
      {Icon && (
        <div className={`p-3.5 rounded-2xl border ${badgeClass} flex-shrink-0 mr-4`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
