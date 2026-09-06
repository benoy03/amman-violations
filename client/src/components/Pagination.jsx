import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, totalItems, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-slate-200 text-xs text-slate-600">
      <div>
        <span>إجمالي السجلات: <strong className="font-bold text-slate-800">{totalItems}</strong> (الصفحة {currentPage} من {totalPages})</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
          title="الصفحة السابقة"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-lg font-bold transition ${
                currentPage === pageNum
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
          title="الصفحة التالية"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
