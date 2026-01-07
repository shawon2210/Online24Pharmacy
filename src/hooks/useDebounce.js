import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value.
 * @param {*} value - The value to debounce.
 * @param {number} delay - The debounce delay in milliseconds. Defaults to 500ms.
 * @returns {*} The debounced value.
 */
export default function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Set debouncedValue to value (passed in) after the specified delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Return a cleanup function that will be called every time ...
      // ... useEffect is re-called. useEffect will be re-called ...
      // ... whenever the value of 'value' or 'delay' changes.
      // This is how we prevent debouncedValue from changing if value is ...
      // ... changed within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );

  return debouncedValue;
}
