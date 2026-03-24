import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, AppColors } from '../constants/colors';
import { ThemePreference, THEME_STORAGE_KEY } from '../types/theme';

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (value: ThemePreference) => Promise<void>;
  /** Resolved palette (system → light or dark) */
  colors: AppColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (
        !cancelled &&
        stored &&
        (stored === 'system' || stored === 'light' || stored === 'dark')
      ) {
        setPreferenceState(stored);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isDark =
    preference === 'dark' || (preference === 'system' && systemScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  const setPreference = useCallback(async (value: ThemePreference) => {
    setPreferenceState(value);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, value);
  }, []);

  const value = useMemo(
    () => ({
      preference,
      setPreference,
      colors,
      isDark,
    }),
    [preference, setPreference, colors, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
