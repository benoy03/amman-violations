import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const TOAST_CONFIG = {
  success: {
    bg: '#ffffff',
    border: 'rgba(16,185,129,0.3)',
    barColor: '#10b981',
    iconBg: 'rgba(16,185,129,0.1)',
    iconColor: '#059669',
    titleColor: '#064e3b',
    textColor: '#065f46',
    icon: CheckCircle2,
    glow: 'rgba(16,185,129,0.15)',
  },
  error: {
    bg: '#ffffff',
    border: 'rgba(239,68,68,0.3)',
    barColor: '#ef4444',
    iconBg: 'rgba(239,68,68,0.1)',
    iconColor: '#dc2626',
    titleColor: '#7f1d1d',
    textColor: '#991b1b',
    icon: AlertCircle,
    glow: 'rgba(239,68,68,0.12)',
  },
  warning: {
    bg: '#ffffff',
    border: 'rgba(245,158,11,0.3)',
    barColor: '#f59e0b',
    iconBg: 'rgba(245,158,11,0.1)',
    iconColor: '#d97706',
    titleColor: '#78350f',
    textColor: '#92400e',
    icon: AlertTriangle,
    glow: 'rgba(245,158,11,0.12)',
  },
  info: {
    bg: '#ffffff',
    border: 'rgba(59,130,246,0.3)',
    barColor: '#3b82f6',
    iconBg: 'rgba(59,130,246,0.1)',
    iconColor: '#2563eb',
    titleColor: '#1e3a8a',
    textColor: '#1e40af',
    icon: Info,
    glow: 'rgba(59,130,246,0.12)',
  },
};

function ToastItem({ toast, onClose }) {
  const [progress, setProgress] = useState(100);
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const Icon = config.icon;
  const duration = toast.duration || 4000;

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div
      className="pointer-events-auto relative overflow-hidden rounded-2xl animate-slide-in-right"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        boxShadow: `0 8px 24px -4px ${config.glow}, 0 4px 8px -2px rgba(0,0,0,0.06)`,
        maxWidth: '380px',
        width: '100%',
      }}
    >
      {/* شريط تقدم متحرك */}
      <div
        className="absolute top-0 right-0 h-0.5 transition-all duration-75"
        style={{ width: `${progress}%`, background: config.barColor, opacity: 0.8 }}
      />

      <div className="flex items-start gap-3 p-4 pr-4">
        {/* الأيقونة */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: config.iconBg, color: config.iconColor }}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* النص */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-xs font-black mb-0.5" style={{ color: config.titleColor }}>
              {toast.title}
            </p>
          )}
          <p className="text-xs font-semibold leading-relaxed" style={{ color: config.textColor }}>
            {toast.message}
          </p>
        </div>

        {/* زر الإغلاق */}
        <button
          onClick={() => onClose(toast.id)}
          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150"
          style={{ background: 'transparent', color: 'rgba(100,116,139,0.6)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#374151'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(100,116,139,0.6)'; }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function ToastContainer({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      dir="rtl"
      className="fixed bottom-5 left-5 z-[9999] flex flex-col-reverse gap-2.5 pointer-events-none"
      style={{ maxWidth: '380px', width: 'calc(100vw - 40px)' }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
}
