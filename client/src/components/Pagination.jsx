import React from 'react';
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, totalItems, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta + 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination-container flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 px-1">
      {/* معلومات الصفحة */}
      <div className="text-xs font-semibold text-slate-500">
        عرض{' '}
        <strong className="font-black text-slate-700">
          {Math.min((currentPage - 1) * 25 + 1, totalItems)}–{Math.min(currentPage * 25, totalItems)}
        </strong>{' '}
        من{' '}
        <strong className="font-black text-slate-700">{totalItems?.toLocaleString('ar')}</strong>{' '}
        سجل
      </div>

      {/* أزرار التنقل */}
      <div className="flex items-center gap-1">
        {/* الأولى */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}
          title="الصفحة الأولى"
        >
          <ChevronsRight className="w-3.5 h-3.5 text-slate-600" />
        </button>

        {/* السابقة */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
          title="الصفحة السابقة"
        >
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        </button>

        {/* أرقام الصفحات */}
        {pageNumbers.map((page, idx) => (
          page === '...' ? (
            <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 font-bold">
              ···
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className="flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black transition-all duration-150"
              style={
                currentPage === page
                  ? {
                      background: 'linear-gradient(135deg, #2668e5, #1d52d2)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(38,104,229,0.35)',
                      border: 'none',
                    }
                  : {
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#374151',
                    }
              }
              onMouseEnter={e => { if (currentPage !== page) { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}}
              onMouseLeave={e => { if (currentPage !== page) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}}
            >
              {page}
            </button>
          )
        ))}

        {/* التالية */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
          title="الصفحة التالية"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
        </button>

        {/* الأخيرة */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}
          title="الصفحة الأخيرة"
        >
          <ChevronsLeft className="w-3.5 h-3.5 text-slate-600" />
        </button>
      </div>
    </div>
  );
}
