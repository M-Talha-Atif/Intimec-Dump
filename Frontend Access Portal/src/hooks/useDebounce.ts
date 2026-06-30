import { useEffect, useRef, useState } from "react";

/**
 * Delays updating the value until after a specified delay has passed
 * since the last change.
 *
 * @param value The input value to debounce.
 * @param delay Delay in milliseconds.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      clearTimeout(handler); // Cancel timeout on value/delay change
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebounceCallback<T extends (...args: never[]) => void>(
  cb: T,
  delay: number
) {
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  return function (...args: Parameters<T>) {
    if (timeoutId.current) {
      // This check is not strictly necessary
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(() => cb(...args), delay);
  };
}
