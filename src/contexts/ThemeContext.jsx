import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentSite, setCurrentSite] = useState(null);
  const [globalTheme, setGlobalTheme] = useState({
    primaryColor: '#0ea5e9',
    secondaryColor: '#64748b',
    fontFamily: 'Inter',
    logo: null,
    favicon: null
  });

  const updateTheme = (newTheme) => {
    setGlobalTheme(prev => ({ ...prev, ...newTheme }));
  };

  const value = {
    currentSite,
    setCurrentSite,
    globalTheme,
    updateTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
