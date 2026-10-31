// Dependencies
import {useEffect, useState} from 'react';

type Theme = 'dark' | 'light';
const STORAGE_KEY = 'vencar-theme';

/** Read the saved theme, tolerating blocked storage. */
function readTheme(): Theme {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/** Keep the theme on the root element and remember it for this viewer. */
export function useTheme(): {theme: Theme; toggleTheme: () => void} {
  const [theme, setTheme] = useState<Theme>(readTheme);
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      return;
    }
  }, [theme]);
  return {theme, toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))};
}
