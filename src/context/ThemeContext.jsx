import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('veriproof-theme');
      if (saved && Object.values(THEMES).includes(saved)) return saved;
      // Legacy theme migration — map removed themes to dark
      if (saved === 'storyteller' || saved === 'immersive') return THEMES.DARK;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
    }
    return THEMES.LIGHT;
  });

  useEffect(() => {
    const root = document.documentElement;
    // Clean all possible theme classes (including legacy)
    ['light', 'dark', 'storyteller', 'immersive'].forEach(t => root.classList.remove(`theme-${t}`));
    root.classList.remove('dark');

    root.classList.add(`theme-${theme}`);
    if (theme === THEMES.DARK) root.classList.add('dark');

    localStorage.setItem('veriproof-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT));
  };

  const isDarkMode = theme === THEMES.DARK;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, toggleTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};
