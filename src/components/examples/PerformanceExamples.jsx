/* eslint-disable react-hooks/set-state-in-effect */
import { memo, useState, useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import usePagination from "../../hooks/usePagination";
import useDebounce from "../../hooks/useDebounce";
import Pagination from "../common/Pagination";
import OptimizedImage from "../common/OptimizedImage";
import SearchBar from "../common/SearchBar";

/**
 * Example 1: Paginated List
 */
export function PaginatedListExample() {
  const [items] = useState(
    Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }))
  );
  const {
    page,
    limit,
    totalPages,
    setTotal,
    _nextPage,
    _prevPage,
    goToPage,
    hasNext,
    hasPrev,
  } = usePagination(1, 10);
  const { t } = useTranslation();
  useEffect(() => {
    setTotal(items.length);
  }, [items.length, setTotal]);
  const currentItems = useMemo(() => {
    const start = (page - 1) * limit;
    return items.slice(start, start + limit);
  }, [items, page, limit]);
  return (
    <div>
      <h2>
        {t("paginatedList", "Paginated List")} ({items.length}{" "}
        {t("items", "items")})
      </h2>
      <ul>
        {currentItems.map((item) => (
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
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const debouncedQuery = useDebounce(query, 500);
  const { t } = useTranslation();
  useEffect(() => {
    if (debouncedQuery) {
      // Simulate API call
      console.log(t("searchingFor", "Searching for:"), debouncedQuery);
      setResults([`${t("resultFor", "Result for")} "${debouncedQuery}"`]);
    }
  }, [debouncedQuery, t]);
  return (
    <div>
      <SearchBar
        onSearch={setQuery}
        placeholder={t("searchProducts", "Search products...")}
      />
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
    console.log("Processing data...");
    return data.map((item) => item * 2);
  }, [data]);

  return (
    <div>
      {processedData.map((item, i) => (
        <div key={i}>{item}</div>
      ))}
    </div>
  );
});

ExpensiveComponent.displayName = "ExpensiveComponent";

/**
 * Example 4: Optimized Images
 */
export function OptimizedImagesExample() {
  const images = [
    { id: 1, src: "/product1.jpg", alt: "Product 1" },
    { id: 2, src: "/product2.jpg", alt: "Product 2" },
    { id: 3, src: "/product3.jpg", alt: "Product 3" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((img) => (
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
  const { t } = useTranslation();
  const handleAddItem = useCallback(() => {
    setItems((prev) => [...prev, `${t("item", "Item")} ${prev.length + 1}`]);
  }, [t]);
  const handleIncrement = useCallback(() => {
    setCount((c) => c + 1);
  }, []);
  return (
    <div>
      <p>
        {t("count", "Count")}: {count}
      </p>
      <button onClick={handleIncrement}>{t("increment", "Increment")}</button>
      <button onClick={handleAddItem}>{t("addItem", "Add Item")}</button>
      <MemoizedList items={items} />
    </div>
  );
}

const MemoizedList = memo(({ items }) => {
  console.log("MemoizedList rendered");
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
});

MemoizedList.displayName = "MemoizedList";
