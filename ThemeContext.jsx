import { createContext, useContext } from 'react';

export const LIGHT_THEME = {
  id: 'light',
  name: 'Yorug‘',
  bg: '#f8fafc',
  sidebarBg: '#ffffff',
  sidebarText: '#0f172a',
  sidebarActiveBg: '#3b82f6',
  sidebarActiveText: '#ffffff',
  accent1: '#3b82f6',
  accent2: '#6366f1',
};

export const ThemeContext = createContext(LIGHT_THEME);
export function useTheme() { return useContext(ThemeContext); }
