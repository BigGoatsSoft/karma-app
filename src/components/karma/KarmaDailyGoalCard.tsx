import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';

interface Props {
  todayKarma: number;
  dailyGoal: number;
}

export function KarmaDailyGoalCard({ todayKarma, dailyGoal }: Props) {
  const { colors: COLORS } = useTheme();
  const dailyProgress = Math.min((todayKarma / dailyGoal) * 100, 100);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: COLORS.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        },
        cardHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        },
        cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
        cardTitle: {
          fontSize: 16,
          color: COLORS.textPrimary,
          fontFamily: FONT.semibold,
        },
        progressText: { fontSize: 14, color: COLORS.textMuted, fontFamily: FONT.regular },
        progressBar: {
          height: 8,
          backgroundColor: COLORS.lightGray,
          borderRadius: 4,
          overflow: 'hidden',
        },
        progressFill: {
          height: '100%',
          backgroundColor: COLORS.primary,
          borderRadius: 4,
        },
        successText: {
          fontSize: 14,
          color: COLORS.success,
          fontFamily: FONT.regular,
          marginTop: 8,
        },
      }),
    [COLORS]
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Ionicons name="trophy" size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Daily goal</Text>
        </View>
        <Text style={styles.progressText}>
          {todayKarma} / {dailyGoal}
        </Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${dailyProgress}%` }]} />
      </View>
      {todayKarma >= dailyGoal && <Text style={styles.successText}>🎉 Goal reached!</Text>}
    </View>
  );
}
