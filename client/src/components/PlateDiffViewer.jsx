import React from 'react';
import JordanianPlate from './JordanianPlate';
import { ArrowLeftRight, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * مكوّن مقارنة بصرية ذكية للوحات الأردنية
 * يوضح الفرق بين الخطأ والصواب مع إبراز الحروف/الأرقام المتبدلة
 */
export default function PlateDiffViewer({ wrongPlate, correctPlate, errorType }) {
  if (!wrongPlate && !correctPlate) return null;

  // حساب الاختلافات في الأرقام
  const getDiffIndices = (str1, str2) => {
    const s1 = (str1 || '').split('-')[1] || str1 || '';
    const s2 = (str2 || '').split('-')[1] || str2 || '';
    const diffs1 = [];
    const diffs2 = [];

    const maxLen = Math.max(s1.length, s2.length);
    for (let i = 0; i < maxLen; i++) {
      if (s1[i] !== s2[i]) {
        if (i < s1.length) diffs1.push(i);
        if (i < s2.length) diffs2.push(i);
      }
    }
    return { diffs1, diffs2 };
  };

  const { diffs1, diffs2 } = getDiffIndices(wrongPlate, correctPlate);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white rounded-3xl p-5 border border-slate-700 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs">
        <span className="font-black text-brand-300 flex items-center gap-1.5">
          <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
          <span>المقارن البصري الذكي للوحات (نظام الرقابة الآلية)</span>
        </span>
        {errorType && (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold">
            {errorType}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* اللوحة الخاطئة */}
        <div className="bg-white/5 rounded-2xl p-4 border border-red-500/30 flex flex-col items-center text-center">
          <div className="flex items-center gap-1 text-xs font-bold text-rose-300 mb-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>اللوحة الخاطئة (صورة الكاميرا / الإدخال الأولي):</span>
          </div>
          <JordanianPlate
            plateNumber={wrongPlate || '50-00000'}
            isWrong={true}
            highlightIndices={diffs1}
            size="lg"
          />
          <span className="text-[11px] text-rose-300/80 mt-2 font-medium">
            الأرقام المحددة باللون الأحمر تم رصد خطأ فيها
          </span>
        </div>

        {/* اللوحة الصحيحة المعدلة */}
        <div className="bg-white/5 rounded-2xl p-4 border border-emerald-500/30 flex flex-col items-center text-center">
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-300 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>اللوحة الصحيحة المعتمدة (بعد التدقيق):</span>
          </div>
          <JordanianPlate
            plateNumber={correctPlate || '50-00000'}
            isWrong={false}
            highlightIndices={diffs2}
            size="lg"
          />
          <span className="text-[11px] text-emerald-300/80 mt-2 font-medium">
            الأرقام المحددة بالأخضر تم تصحيحها واعتمادها
          </span>
        </div>
      </div>
    </div>
  );
}
