import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const TOAST_STYLES = {
  success: {
    bg: 'bg-white',
    border: 'border-emerald-500/40',
    iconBg: 'bg-emerald-50 text-emerald-600',
    titleColor: 'text-emerald-950',
    textColor: 'text-emerald-800',
    bar: 'bg-emerald-500',
    icon: CheckCircle2
  },
  error: {
    bg: 'bg-white',
    border: 'border-red-500/40',
    iconBg: 'bg-red-50 text-red-600',
    titleColor: 'text-red-950',
    textColor: 'text-red-800',
    bar: 'bg-red-500',
    icon: AlertCircle
  },
  warning: {
    bg: 'bg-white',
    border: 'border-amber-500/40',
    iconBg: 'bg-amber-50 text-amber-600',
    titleColor: 'text-amber-950',
    textColor: 'text-amber-800',
    bar: 'bg-amber-500',
    icon: AlertTriangle
  },
  info: {
    bg: 'bg-white',
    border: 'border-blue-500/40',
    iconBg: 'bg-blue-50 text-blue-600',
    titleColor: 'text-blue-950',
    textColor: 'text-blue-800',
    bar: 'bg-blue-500',
    icon: Info
  }
};

export default function ToastContainer({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      dir="rtl"
      className="fixed bottom-5 left-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => {
        const style = TOAST_STYLES[t.type] || TOAST_STYLES.info;
        const Icon = style.icon;

        return (
          <div
            key={t.id}
            className={`pointer-events-auto relative overflow-hidden rounded-2xl border shadow-xl ${style.bg} ${style.border} p-4 transition-all duration-300 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-bottom-3`}
          >
            {/* مؤشر شريط سفلي */}
            <div className={`absolute bottom-0 right-0 left-0 h-1 ${style.bar} opacity-70`}></div>

            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl flex-shrink-0 ${style.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 pr-0.5">
                {t.title && (
                  <h4 className={`text-xs font-black ${style.titleColor}`}>
                    {t.title}
                  </h4>
                )}
                <p className={`text-xs font-semibold leading-relaxed mt-0.5 ${style.textColor}`}>
                  {t.message}
                </p>
              </div>

              <button
                onClick={() => onClose(t.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
