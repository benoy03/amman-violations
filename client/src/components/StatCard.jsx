import React from 'react';

const colorMap = {
  blue: {
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.15)',
    icon: 'rgba(59,130,246,0.15)',
    iconColor: '#2563eb',
    value: '#1e3a8a',
    glow: 'rgba(59,130,246,0.15)',
    bar: '#3b82f6',
  },
  green: {
    bg: 'rgba(16,185,129,0.07)',
    border: 'rgba(16,185,129,0.15)',
    icon: 'rgba(16,185,129,0.15)',
    iconColor: '#059669',
    value: '#064e3b',
    glow: 'rgba(16,185,129,0.12)',
    bar: '#10b981',
  },
  emerald: {
    bg: 'rgba(16,185,129,0.07)',
    border: 'rgba(16,185,129,0.15)',
    icon: 'rgba(16,185,129,0.15)',
    iconColor: '#059669',
    value: '#064e3b',
    glow: 'rgba(16,185,129,0.12)',
    bar: '#10b981',
  },
  teal: {
    bg: 'rgba(20,184,166,0.07)',
    border: 'rgba(20,184,166,0.15)',
    icon: 'rgba(20,184,166,0.15)',
    iconColor: '#0d9488',
    value: '#134e4a',
    glow: 'rgba(20,184,166,0.12)',
    bar: '#14b8a6',
  },
  amber: {
    bg: 'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.15)',
    icon: 'rgba(245,158,11,0.15)',
    iconColor: '#d97706',
    value: '#78350f',
    glow: 'rgba(245,158,11,0.12)',
    bar: '#f59e0b',
  },
  orange: {
    bg: 'rgba(249,115,22,0.07)',
    border: 'rgba(249,115,22,0.15)',
    icon: 'rgba(249,115,22,0.15)',
    iconColor: '#ea580c',
    value: '#7c2d12',
    glow: 'rgba(249,115,22,0.12)',
    bar: '#f97316',
  },
  red: {
    bg: 'rgba(239,68,68,0.07)',
    border: 'rgba(239,68,68,0.15)',
    icon: 'rgba(239,68,68,0.15)',
    iconColor: '#dc2626',
    value: '#7f1d1d',
    glow: 'rgba(239,68,68,0.12)',
    bar: '#ef4444',
  },
  rose: {
    bg: 'rgba(244,63,94,0.07)',
    border: 'rgba(244,63,94,0.15)',
    icon: 'rgba(244,63,94,0.15)',
    iconColor: '#e11d48',
    value: '#881337',
    glow: 'rgba(244,63,94,0.12)',
    bar: '#f43f5e',
  },
  purple: {
    bg: 'rgba(139,92,246,0.07)',
    border: 'rgba(139,92,246,0.15)',
    icon: 'rgba(139,92,246,0.15)',
    iconColor: '#7c3aed',
    value: '#4c1d95',
    glow: 'rgba(139,92,246,0.12)',
    bar: '#8b5cf6',
  },
  indigo: {
    bg: 'rgba(99,102,241,0.07)',
    border: 'rgba(99,102,241,0.15)',
    icon: 'rgba(99,102,241,0.15)',
    iconColor: '#4f46e5',
    value: '#312e81',
    glow: 'rgba(99,102,241,0.12)',
    bar: '#6366f1',
  },
  brand: {
    bg: 'rgba(38,104,229,0.07)',
    border: 'rgba(38,104,229,0.15)',
    icon: 'rgba(38,104,229,0.15)',
    iconColor: '#2668e5',
    value: '#0f2942',
    glow: 'rgba(38,104,229,0.12)',
    bar: '#2668e5',
  },
  slate: {
    bg: 'rgba(100,116,139,0.07)',
    border: 'rgba(100,116,139,0.15)',
    icon: 'rgba(100,116,139,0.1)',
    iconColor: '#475569',
    value: '#1e293b',
    glow: 'rgba(100,116,139,0.08)',
    bar: '#64748b',
  },
};

export default function StatCard({ title, value, subtext, icon: Icon, color = 'blue', trend }) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden group cursor-default"
      style={{
        background: `linear-gradient(135deg, white 0%, ${c.bg.replace(')', ', 0.3)')} 100%)`,
        border: `1px solid ${c.border}`,
        boxShadow: `0 1px 3px rgba(0,0,0,0.05), 0 8px 24px -8px ${c.glow}`,
        transition: 'transform 200ms ease, box-shadow 200ms ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.08), 0 16px 32px -8px ${c.glow}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 1px 3px rgba(0,0,0,0.05), 0 8px 24px -8px ${c.glow}`;
      }}
    >
      {/* خلفية الأيقونة الكبيرة */}
      <div
        className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full opacity-30 transition-transform duration-300 group-hover:scale-125"
        style={{ background: c.bar, filter: 'blur(20px)' }}
      />

      <div className="relative flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-widest mb-2 truncate"
            style={{ color: c.iconColor, opacity: 0.8 }}>
            {title}
          </p>
          <p className="text-3xl sm:text-4xl font-black leading-none mb-2"
            style={{ color: c.value }}>
            {value ?? '—'}
          </p>
          {subtext && (
            <p className="text-xs font-semibold truncate" style={{ color: 'rgba(71,85,105,0.7)' }} title={subtext}>
              {subtext}
            </p>
          )}
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium">vs الفترة السابقة</span>
            </div>
          )}
        </div>

        {Icon && (
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mr-3 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
            style={{ background: c.icon, color: c.iconColor }}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* شريط التمييز السفلي */}
      <div
        className="absolute bottom-0 right-0 left-0 h-0.5 rounded-b-2xl opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${c.bar}, transparent)` }}
      />
    </div>
  );
}
