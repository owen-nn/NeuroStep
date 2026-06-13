import React, { createContext, useContext, useState } from 'react';
import { DARK, LIGHT, type ColorSet } from '../constants/colors';

export type Theme = 'dark' | 'light';

interface ThemeCtxType {
  theme:       Theme;
  colors:      ColorSet;
  toggleTheme: () => void;
}

const ThemeCtx = createContext<ThemeCtxType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  return (
    <ThemeCtx.Provider value={{
      theme,
      colors:      theme === 'dark' ? DARK : LIGHT,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme(): ThemeCtxType {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be called inside ThemeProvider');
  return ctx;
}

export function useColors(): ColorSet {
  return useTheme().colors;
}
