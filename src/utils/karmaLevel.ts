import type { AppColors } from '../constants/colors';

export function getKarmaLevelLabel(karma: number, colors: AppColors): { level: string; color: string } {
  if (karma >= 500) return { level: 'Enlightened', color: colors.warning };
  if (karma >= 300) return { level: 'Master', color: colors.secondary };
  if (karma >= 150) return { level: 'Sage', color: colors.primary };
  if (karma >= 50) return { level: 'Apprentice', color: colors.darkGray };
  if (karma >= 0) return { level: 'Novice', color: colors.gray };
  if (karma >= -50) return { level: 'Straying', color: colors.warning };
  return { level: 'Shadow', color: colors.error };
}
