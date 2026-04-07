import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';

interface Props {
  todayKarma: number;
  dailyGoal: number;
  animKey: number;
}

export function KarmaDailyGoalCard({ todayKarma, dailyGoal, animKey }: Props) {
  const { colors: COLORS } = useTheme();
  const dailyProgress = todayKarma <= 0 ? 0 : Math.min(todayKarma / dailyGoal, 1);

  const [barWidth, setBarWidth] = useState(0);
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animKey === 0 || barWidth === 0) return;
    animWidth.setValue(0);
    Animated.timing(animWidth, {
      toValue: dailyProgress * barWidth,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [animKey, barWidth, dailyProgress]);

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
          borderRadius: 4,
          backgroundColor: dailyProgress >= 1 ? COLORS.success : COLORS.primary,
        },
        successText: {
          fontSize: 14,
          color: COLORS.success,
          fontFamily: FONT.regular,
          marginTop: 8,
        },
      }),
    [COLORS, dailyProgress]
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
      <View
        style={styles.progressBar}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View style={[styles.progressFill, { width: animWidth }]} />
      </View>
      {todayKarma >= dailyGoal && <Text style={styles.successText}>🎉 Goal reached!</Text>}
    </View>
  );
}
