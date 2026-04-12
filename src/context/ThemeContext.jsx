import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  STORYTELLER: 'storyteller', // Cabinet of Wonders inspired
  IMMERSIVE: 'immersive'      // Sun Hung inspired
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('veriproof-theme');
      if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
    }
    return THEMES.LIGHT;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove all theme classes
    Object.values(THEMES).forEach(t => root.classList.remove(`theme-${t}`));
    root.classList.remove('dark'); // Keep 'dark' for tailwind compatibility if needed
    
    root.classList.add(`theme-${theme}`);
    if (theme === THEMES.DARK || theme === THEMES.IMMERSIVE) {
      root.classList.add('dark');
    }
    
    localStorage.setItem('veriproof-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT));
  };

  const isDarkMode = theme === THEMES.DARK || theme === THEMES.IMMERSIVE;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, toggleTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};
