'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-outline"
      style={{ fontSize: '1.2rem', padding: '0.3rem 0.6rem' }}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}