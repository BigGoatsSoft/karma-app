import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';

interface Props {
  goodCount: number;
  badCount: number;
}

export function KarmaStatsRow({ goodCount, badCount }: Props) {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
        statCard: {
          flex: 1,
          backgroundColor: COLORS.surface,
          borderRadius: 16,
          padding: 16,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        },
        statValue: {
          fontSize: 32,
          color: COLORS.textPrimary,
          fontFamily: FONT.bold,
        },
        statLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
        statText: { fontSize: 12, color: COLORS.textMuted, fontFamily: FONT.regular },
      }),
    [COLORS]
  );

  return (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{goodCount}</Text>
        <View style={styles.statLabel}>
          <Ionicons name="arrow-up" size={14} color={COLORS.success} />
          <Text style={styles.statText}>Good deeds</Text>
        </View>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{badCount}</Text>
        <View style={styles.statLabel}>
          <Ionicons name="arrow-down" size={14} color={COLORS.error} />
          <Text style={styles.statText}>Bad deeds</Text>
        </View>
      </View>
    </View>
  );
}
