import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Modern pagination component with enhanced design
 */
const Pagination = memo(
  ({ currentPage, totalPages, onPageChange, hasNext, hasPrev }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const showPages = 5;

      let start = Math.max(1, currentPage - Math.floor(showPages / 2));
      let end = Math.min(totalPages, start + showPages - 1);

      if (end - start < showPages - 1) {
        start = Math.max(1, end - showPages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    };

    return (
      <div className="flex items-center justify-center gap-2 mt-12 mb-8">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
            hasPrev
              ? "bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 min-w-[3rem] ${
                pageNum === currentPage
                  ? "bg-linear-to-r from-emerald-500 to-cyan-500 text-white shadow-lg scale-105"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-md"
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
            hasNext
              ? "bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700"
          }`}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }
);

Pagination.displayName = "Pagination";

export default Pagination;
