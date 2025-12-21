import { useEffect } from 'react';

export default function useTitle(title) {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const previous = document.title;
    if (typeof title === 'function') {
      const resolved = title();
      document.title = resolved ?? '';
    } else if (title != null) {
      document.title = title;
    }

    return () => {
      document.title = previous;
    };
  }, [title]);
}
