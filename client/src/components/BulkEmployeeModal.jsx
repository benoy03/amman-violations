import React, { useState, useMemo } from 'react';
import api from '../api/axiosInstance';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Copy,
  PlusCircle,
  Trash2,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export default function BulkEmployeeModal({ isOpen, onClose, activeTab, onRefresh }) {
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isLocation = activeTab === 'locations';

  const tabTitles = {
    extractors: 'المستخرجين',
    auditors: 'المدققين',
    modifiers: 'المعدلين',
    reporters: 'المبلغين',
    locations: 'مواقع الكاميرات'
  };

  const title = tabTitles[activeTab] || 'الموظفين';

  // معالجة النصوص المفصولة وتحويلها إلى عناصر صالحة
  const parsedItems = useMemo(() => {
    if (!rawText.trim()) return [];

    const lines = rawText.split(/\r?\n/);
    const results = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (isLocation) {
        // فحص مواقع الكاميرات (اسم, منطقة أو اسم فقط)
        let name = '';
        let zone = 'عمّان';

        if (line.includes(',')) {
          const parts = line.split(',');
          name = parts[0].trim();
          zone = parts[1]?.trim() || 'عمّان';
        } else if (line.includes('\t')) {
          const parts = line.split('\t');
          name = parts[0].trim();
          zone = parts[1]?.trim() || 'عمّان';
        } else {
          name = line;
        }

        if (name) {
          results.push({ name, zone });
        }
      } else {
        // فحص الموظفين (رقم, اسم أو رقم [Tab] اسم أو رقم - اسم)
        let number = '';
        let name = '';

        if (line.includes('\t')) {
          const parts = line.split('\t');
          number = parts[0].trim();
          name = parts.slice(1).join(' ').trim();
        } else if (line.includes(',')) {
          const parts = line.split(',');
          number = parts[0].trim();
          name = parts.slice(1).join(' ').trim();
        } else if (line.includes(' - ')) {
          const parts = line.split(' - ');
          number = parts[0].trim();
          name = parts.slice(1).join(' - ').trim();
        } else {
          // محاولة فصل الرقم في أول الكلمة إذا كان أرقاماً
          const match = line.match(/^([0-9]+)\s+(.+)$/);
          if (match) {
            number = match[1].trim();
            name = match[2].trim();
          }
        }

        if (number && name) {
          results.push({ number, name });
        }
      }
    }

    return results;
  }, [rawText, isLocation]);

  if (!isOpen) return null;

  const handleInsert = async () => {
    if (parsedItems.length === 0) {
      setErrorMsg('لا توجد بيانات صالحة للإدراج. يرجى مراجعة التنسيق أدناه.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLocation) {
        const res = await api.post('/locations/bulk', { items: parsedItems });
        setSuccessMsg(res.data.message || `تمت إضافة (${parsedItems.length}) موقع بنجاح!`);
      } else {
        const res = await api.post(`/employees/${activeTab}/bulk`, { items: parsedItems });
        setSuccessMsg(res.data.message || `تم إدراج (${parsedItems.length}) موظف بنجاح!`);
      }

      setTimeout(() => {
        onRefresh();
        onClose();
        setRawText('');
        setSuccessMsg('');
      }, 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'فشل إدراج البيانات. تحقق من صحة المدخلات.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    if (isLocation) {
      setRawText(
`شارع الأردن - دوار الاستقلال, شمال عمّان
شارع مكة - تقاطع الحرمين, غرب عمّان
شارع زهران - إشارات الدوار الثامن, غرب عمّان
شارع الشهيد - إشارة طبربور, شمال عمّان
طريق المطار - جسر مادبا, جنوب عمّان`
      );
    } else {
      setRawText(
`101\tأحمد محمود العبداللات
102\tمحمد خليل العدوان
103\tطارق زياد المجالي
104\tعمر إبراهيم الحديد
105\tحمزة صالح المناصير`
      );
    }
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* ترويسة النافذة */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                لصق وإدراج سريع لقائمة {title}
              </h3>
              <p className="text-xs text-slate-500">
                انسخ صفوفاً مباشرة من ملف Excel أو قائمة نصية والصقها هنا ليتم حفظها دفعة واحدة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* محتوى الإدخال والمعاينة */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* رسائل التنبيه */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* نصائح التنسيق */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-black">الصيغ المدعومة للصق:</span>
                <span className="mr-1 text-[11px] text-amber-800">
                  {isLocation
                    ? 'اسم الموقع, المنطقة (أو اسم الموقع فقط في كل سطر)'
                    : 'الرقم [Tab أو فاصلة , أو شرطة -] الاسم'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={loadSample}
              className="text-[11px] font-bold bg-amber-200/80 hover:bg-amber-300 text-amber-950 px-3 py-1 rounded-lg transition whitespace-nowrap"
            >
              تجربة مثال توضيحي
            </button>
          </div>

          {/* مربع اللصق */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-slate-700">
                الصق النص أو أعمدة Excel هنا:
              </label>
              {rawText && (
                <button
                  type="button"
                  onClick={() => setRawText('')}
                  className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>تفريغ النص</span>
                </button>
              )}
            </div>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              dir="rtl"
              placeholder={
                isLocation
                  ? `شارع الأردن - دوار الاستقلال, شمال عمّان\nشارع مكة - تقاطع الحرمين, غرب عمّان`
                  : `101\tأحمد محمود العبداللات\n102\tمحمد خليل العدوان\n103\tطارق زياد المجالي`
              }
              className="w-full p-3.5 rounded-2xl border border-slate-300 text-xs font-mono font-bold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-slate-50/50 resize-y"
            />
          </div>

          {/* جدول المعاينة الحية */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <span>المعاينة المباشرة قبل الحفظ</span>
                <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[11px] font-black border border-brand-200">
                  {parsedItems.length} عنصر جاهز للإدراج
                </span>
              </h4>
            </div>

            {parsedItems.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-bold">
                الصق البيانات أعلاه لتظهر المعاينة هنا تلقائياً
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-right text-xs">
                  <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 w-12 text-center">#</th>
                      {isLocation ? (
                        <>
                          <th className="p-2.5">اسم الموقع / الشارع</th>
                          <th className="p-2.5">المنطقة</th>
                        </>
                      ) : (
                        <>
                          <th className="p-2.5 w-24">الرقم</th>
                          <th className="p-2.5">الاسم الحقيقي بالكامل</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-400 font-bold text-[11px]">
                          {idx + 1}
                        </td>
                        {isLocation ? (
                          <>
                            <td className="p-2 font-bold text-slate-800">{item.name}</td>
                            <td className="p-2 text-slate-600">{item.zone}</td>
                          </>
                        ) : (
                          <>
                            <td className="p-2 font-black text-rose-700">{item.number}</td>
                            <td className="p-2 font-bold text-slate-800">{item.name}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold text-xs transition"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={loading || parsedItems.length === 0}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs shadow-md shadow-brand-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>
              {loading
                ? 'جاري الحفظ في النظام...'
                : `حفظ وإدراج الكل (${parsedItems.length}) في النظام`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
