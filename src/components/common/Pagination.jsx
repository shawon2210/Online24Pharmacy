import { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable pagination component
 */
const Pagination = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange,
  hasNext,
  hasPrev 
}) => {
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
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {getPageNumbers().map(pageNum => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            pageNum === currentPage
              ? 'bg-emerald-600 text-white'
              : 'border hover:bg-gray-50'
          }`}
        >
          {pageNum}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
