import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';

interface Props {
  weeklyTotal: number;
}

export function KarmaWeeklyCard({ weeklyTotal }: Props) {
  const { colors: COLORS } = useTheme();
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
          marginBottom: 0,
        },
        cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
        cardTitle: {
          fontSize: 16,
          color: COLORS.textPrimary,
          fontFamily: FONT.semibold,
        },
        weeklyKarma: { fontSize: 24, fontFamily: FONT.bold },
      }),
    [COLORS]
  );

  const color = weeklyTotal >= 0 ? COLORS.success : COLORS.error;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Ionicons name="calendar" size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Weekly karma</Text>
        </View>
        <Text style={[styles.weeklyKarma, { color }]}>
          {weeklyTotal >= 0 ? '+' : ''}
          {weeklyTotal}
        </Text>
      </View>
    </View>
  );
}
