import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'luxury-editorial' | 'minimal-clean' | 'dark-fashion' | 'soft-neutral';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('luxury-editorial');

  useEffect(() => {
    // Remove other theme classes
    document.documentElement.classList.remove('luxury-editorial', 'minimal-clean', 'dark-fashion', 'soft-neutral');
    document.documentElement.classList.add(theme);
    
    if (theme === 'dark-fashion') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
