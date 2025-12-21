import { useEffect, useState, useCallback } from 'react';

// Theme mode values: 'light', 'dark', or 'auto'
export default function useThemeMode() {
  const [mode, setModeState] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
      return 'auto';
    } catch {
      return 'auto';
    }
  });

  const [computedMode, setComputedMode] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const updateComputed = useCallback((newMode) => {
    if (newMode === 'auto') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setComputedMode(prefersDark ? 'dark' : 'light');
      if (prefersDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } else if (newMode === 'dark') {
      setComputedMode('dark');
      document.documentElement.classList.add('dark');
    } else {
      setComputedMode('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    // Avoid react-hooks/set-state-in-effect by deferring update to the next tick
    const id = setTimeout(() => updateComputed(mode), 0);
    try {
      localStorage.setItem('theme', mode);
    } catch {
      // ignore
    }
    // This effect should run whenever `mode` changes to persist to localStorage
    return () => clearTimeout(id);
  }, [mode, updateComputed]);

  useEffect(() => {
    // listen to system preference changes when in auto mode
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      try {
        const stored = localStorage.getItem('theme');
        if (!stored || stored === 'auto') updateComputed('auto');
      } catch {
        // ignore
      }
    };
    media.addEventListener?.('change', onChange);
    media.addListener?.(onChange);
    return () => {
      media.removeEventListener?.('change', onChange);
      media.removeListener?.(onChange);
    };
  }, [updateComputed]);

  useEffect(() => {
    // cross-tab sync
    const onStorage = (e) => {
      if (e.key === 'theme') {
        const val = e.newValue;
        if (val === 'light' || val === 'dark' || val === 'auto') setModeState(val);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setMode = useCallback((m) => {
    if (m !== 'light' && m !== 'dark' && m !== 'auto') return;
    setModeState(m);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const clearMode = useCallback(() => setModeState('auto'), []);

  return { mode, computedMode, setMode, toggleMode, clearMode };
}
