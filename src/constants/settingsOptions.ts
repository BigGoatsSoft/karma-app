import type { ThemePreference } from '../types/theme';

export const COUNTRIES = [
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾' },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]['code'];

export const PERSONALITIES = [
  {
    value: 'neutral' as const,
    label: 'Neutral',
    icon: 'remove-circle-outline' as const,
    description: 'Objective assessment of your actions',
  },
  {
    value: 'encouraging' as const,
    label: 'Encouraging',
    icon: 'happy-outline' as const,
    description: 'Positive and supportive replies',
  },
  {
    value: 'strict' as const,
    label: 'Strict',
    icon: 'alert-circle-outline' as const,
    description: 'Direct, demanding feedback',
  },
];

export const DAILY_GOALS = [10, 25, 50, 75, 100, 150, 200] as const;

export const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];
