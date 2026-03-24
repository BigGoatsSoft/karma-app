import type { KarmaResponse } from '../types';

export function sumTodayKarma(entries: KarmaResponse[]): number {
  const today = new Date().toISOString().split('T')[0];
  return entries
    .filter((entry) => entry.createdAt.startsWith(today))
    .reduce((sum, entry) => sum + entry.karma, 0);
}

export function sumWeeklyKarma(entries: KarmaResponse[]): number {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return entries
    .filter((entry) => new Date(entry.createdAt) >= weekAgo)
    .reduce((sum, entry) => sum + entry.karma, 0);
}
