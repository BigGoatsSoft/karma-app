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
    value: 'usual' as const,
    label: 'Usual',
    icon: 'chatbubble-outline' as const,
    description: 'Friendly everyday conversation',
  },
  {
    value: 'business' as const,
    label: 'Business',
    icon: 'briefcase-outline' as const,
    description: 'Professional and formal feedback',
  },
  {
    value: 'bad_guy' as const,
    label: 'Bad Guy 🔥 18+',
    icon: 'flame-outline' as const,
    description: 'Blunt, crude and brutally honest',
  },
];

export const DAILY_GOALS = [10, 25, 50, 75, 100, 150, 200] as const;

export const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];
