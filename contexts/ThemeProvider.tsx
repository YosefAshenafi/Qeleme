import React, { createContext, useContext } from 'react';

type Theme = {
  colors: {
    primary: string;
    background: string;
    card: string;
    cardAlt: string;
    cardGradientStart: string;
    cardGradientEnd: string;
  };
};

const theme: Theme = {
  colors: {
    primary: '#FFA000',
    background: '#FFFFFF',
    card: '#FFFFFF',
    cardAlt: '#FFF3E0',
    cardGradientStart: '#FFE0B2',
    cardGradientEnd: '#FFCC80',
  },
};

const ThemeContext = createContext<{ theme: Theme }>({ theme });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 