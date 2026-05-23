import { useState, useEffect } from 'react';

/**
 * useDebounce — delays updating the returned value until `delay` ms
 * have passed since the last change to `value`.
 *
 * @param {any}    value - the value to debounce
 * @param {number} delay - debounce delay in ms (default 500)
 * @returns debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
