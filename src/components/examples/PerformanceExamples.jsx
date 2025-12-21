import { memo, useState, useCallback, useMemo } from 'react';
import usePagination from '../../hooks/usePagination';
import useDebounce from '../../hooks/useDebounce';
import Pagination from '../common/Pagination';
import OptimizedImage from '../common/OptimizedImage';
import SearchBar from '../common/SearchBar';

/**
 * Example 1: Paginated List
 */
export function PaginatedListExample() {
  const [items] = useState(Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` })));
  const { page, limit, totalPages, setTotal, nextPage, prevPage, goToPage, hasNext, hasPrev } = usePagination(1, 10);

  // Set total on mount
  React.useEffect(() => {
    setTotal(items.length);
  }, [items.length, setTotal]);

  // Get current page items
  const currentItems = useMemo(() => {
    const start = (page - 1) * limit;
    return items.slice(start, start + limit);
  }, [items, page, limit]);

  return (
    <div>
      <h2>Paginated List ({items.length} items)</h2>
      <ul>
        {currentItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={goToPage}
        hasNext={hasNext}
        hasPrev={hasPrev}
      />
    </div>
  );
}

/**
 * Example 2: Debounced Search
 */
export function DebouncedSearchExample() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const debouncedQuery = useDebounce(query, 500);

  React.useEffect(() => {
    if (debouncedQuery) {
      // Simulate API call
      console.log('Searching for:', debouncedQuery);
      setResults([`Result for "${debouncedQuery}"`]);
    }
  }, [debouncedQuery]);

  return (
    <div>
      <SearchBar onSearch={setQuery} placeholder="Search products..." />
      <ul>
        {results.map((result, i) => (
          <li key={i}>{result}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 3: Memoized Component
 */
const ExpensiveComponent = memo(({ data }) => {
  // Expensive calculation
  const processedData = useMemo(() => {
    console.log('Processing data...');
    return data.map(item => item * 2);
  }, [data]);

  return (
    <div>
      {processedData.map((item, i) => (
        <div key={i}>{item}</div>
      ))}
    </div>
  );
});

ExpensiveComponent.displayName = 'ExpensiveComponent';

/**
 * Example 4: Optimized Images
 */
export function OptimizedImagesExample() {
  const images = [
    { id: 1, src: '/product1.jpg', alt: 'Product 1' },
    { id: 2, src: '/product2.jpg', alt: 'Product 2' },
    { id: 3, src: '/product3.jpg', alt: 'Product 3' }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map(img => (
        <OptimizedImage
          key={img.id}
          src={img.src}
          alt={img.alt}
          className="w-full h-48 object-cover rounded-lg"
        />
      ))}
    </div>
  );
}

/**
 * Example 5: Callback Optimization
 */
export function CallbackOptimizationExample() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);

  // Memoized callback
  const handleAddItem = useCallback(() => {
    setItems(prev => [...prev, `Item ${prev.length + 1}`]);
  }, []);

  // Memoized callback with dependency
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleIncrement}>Increment</button>
      <button onClick={handleAddItem}>Add Item</button>
      <MemoizedList items={items} />
    </div>
  );
}

const MemoizedList = memo(({ items }) => {
  console.log('MemoizedList rendered');
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
});

MemoizedList.displayName = 'MemoizedList';
