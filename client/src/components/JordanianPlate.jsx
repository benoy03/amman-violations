import React from 'react';

/**
 * مكوّن بصري واقعي يطابق شكل لوحات المركبات الأردنية الرسمية
 * مع دعم تمييز الاختلافات (Diff Highlighting)
 */
export default function JordanianPlate({
  plateNumber,
  isWrong = false,
  highlightIndices = [],
  size = 'md'
}) {
  if (!plateNumber) return null;

  // تفكيك اللوحة إلى رمز المحافظة/الفئة والرقم الأساسي (مثلاً: 50-98432 أو 10-12345)
  const parts = plateNumber.includes('-') ? plateNumber.split('-') : ['', plateNumber];
  const code = parts[0] || '50';
  const number = parts[1] || plateNumber;

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-11 px-3 text-sm',
    lg: 'h-14 px-4 text-lg'
  };

  return (
    <div
      dir="ltr"
      className={`inline-flex items-center bg-white text-black font-black border-2 rounded-lg shadow-sm font-mono tracking-widest select-none ${
        isWrong ? 'border-rose-600 ring-2 ring-rose-200' : 'border-slate-800'
      } ${sizeClasses[size] || sizeClasses.md}`}
      style={{
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.08)'
      }}
    >
      {/* شريط الأردن الجانبي */}
      <div className="flex flex-col items-center justify-center pr-2 border-r-2 border-slate-700 h-full text-[9px] font-sans font-bold leading-tight text-slate-800">
        <span className="text-emerald-700">الأردن</span>
        <span className="text-[7px] text-slate-500 uppercase tracking-tighter">JORDAN</span>
      </div>

      {/* رمز الفئة / المحافظة */}
      {code && (
        <div className="px-2 font-black text-slate-900 border-r-2 border-slate-300 h-full flex items-center">
          {code}
        </div>
      )}

      {/* رقم المركبة */}
      <div className="pl-2.5 font-mono font-black text-slate-950 flex items-center">
        {number.split('').map((char, idx) => {
          const isHighlighted = highlightIndices.includes(idx);
          return (
            <span
              key={idx}
              className={`${
                isHighlighted
                  ? isWrong
                    ? 'bg-rose-500 text-white px-0.5 rounded'
                    : 'bg-emerald-500 text-white px-0.5 rounded'
                  : ''
              }`}
            >
              {char}
            </span>
          );
        })}
      </div>
    </div>
  );
}
