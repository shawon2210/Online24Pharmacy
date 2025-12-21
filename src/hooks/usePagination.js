import { useState, useCallback } from 'react';

/**
 * Custom hook for pagination
 * @param {number} initialPage - Initial page number
 * @param {number} initialLimit - Items per page
 * @returns {Object} Pagination state and controls
 */
export default function usePagination(initialPage = 1, initialLimit = 12) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  const nextPage = useCallback(() => {
    setPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback((pageNum) => {
    setPage(Math.max(1, Math.min(pageNum, totalPages)));
  }, [totalPages]);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    limit,
    total,
    totalPages,
    setTotal,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
    reset,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}
