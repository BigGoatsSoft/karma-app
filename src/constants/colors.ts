export type AppColors = {
  primary: string;
  secondary: string;
  tertiary: string;
  neutral: string;
  white: string;
  black: string;
  gray: string;
  lightGray: string;
  darkGray: string;
  error: string;
  success: string;
  warning: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  background: string;
  cardBackground: string;
  inputBackground: string;
  /** Cards, inputs, tab bar — not necessarily literal white */
  surface: string;
};

export const lightColors: AppColors = {
  primary: '#2D6A4F',
  secondary: '#52B788',
  tertiary: '#1B4332',
  neutral: '#F8FAF9',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#95D5B2',
  lightGray: '#D8F3DC',
  darkGray: '#40916C',
  error: '#DC2626',
  success: '#52B788',
  warning: '#F59E0B',
  textPrimary: '#1B4332',
  textSecondary: '#2D6A4F',
  textMuted: '#74C69D',
  background: '#F8FAF9',
  cardBackground: '#FFFFFF',
  inputBackground: '#FFFFFF',
  surface: '#FFFFFF',
};

export const darkColors: AppColors = {
  primary: '#52B788',
  secondary: '#74C69D',
  tertiary: '#95D5B2',
  neutral: '#0F1914',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6B9080',
  lightGray: '#2D3F36',
  darkGray: '#74C69D',
  error: '#F87171',
  success: '#52B788',
  warning: '#FBBF24',
  textPrimary: '#E8F5EC',
  textSecondary: '#B8D4C4',
  textMuted: '#8BA99A',
  background: '#0C1210',
  cardBackground: '#1A2621',
  inputBackground: '#1A2621',
  surface: '#1A2621',
};

/** @deprecated Use useTheme().colors */
export const COLORS = lightColors;
