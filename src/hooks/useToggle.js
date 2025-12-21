import { useState, useCallback } from 'react';

/**
 * Custom hook for boolean toggle state
 * @param {boolean} initialValue - Initial state
 * @returns {[boolean, Function, Function, Function]} State, toggle, setTrue, setFalse
 */
export default function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, toggle, setTrue, setFalse];
}
