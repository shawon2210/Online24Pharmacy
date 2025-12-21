import { memo, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';

/**
 * Search bar with debounced input
 */
const SearchBar = memo(({ 
  onSearch, 
  placeholder = 'Search...', 
  delay = 500 
}) => {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, delay);

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debouncedValue !== undefined) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      />
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
