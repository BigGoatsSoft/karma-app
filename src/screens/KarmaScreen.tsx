import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../constants/fonts';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';
import type { KarmaResponse } from '../types';
import { sumTodayKarma, sumWeeklyKarma } from '../utils/karmaStats';
import { KarmaHeroCircle } from '../components/karma/KarmaHeroCircle';
import { KarmaSectionTitle } from '../components/karma/KarmaSectionTitle';
import { KarmaDailyGoalCard } from '../components/karma/KarmaDailyGoalCard';
import { KarmaStatsRow } from '../components/karma/KarmaStatsRow';
import { KarmaWeeklyCard } from '../components/karma/KarmaWeeklyCard';
import { KarmaRecentActions } from '../components/karma/KarmaRecentActions';
import { KarmaHistorySheet } from '../components/karma/KarmaHistorySheet';

export default function KarmaScreen() {
  const { colors: COLORS } = useTheme();
  const { user, refreshUser } = useAuth();
  const [karmaHistory, setKarmaHistory] = useState<KarmaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyVisible, setHistoryVisible] = useState(false);
  const focusCount = useRef(0);
  const [animKey, setAnimKey] = useState(0);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: COLORS.background },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        },
        contentContainer: { padding: 16, paddingTop: 24 },
        historyBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: COLORS.surface,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 16,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        },
        historyBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
        historyBtnText: {
          fontSize: 16,
          fontFamily: FONT.semibold,
          color: COLORS.textPrimary,
        },
      }),
    [COLORS]
  );

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      focusCount.current += 1;
      setAnimKey(focusCount.current);
    }, [])
  );

  const loadData = async () => {
    try {
      await refreshUser();
      const history = await apiService.getUserKarma();
      setKarmaHistory(history);
    } catch (error) {
      console.error('Error loading karma data:', error);
    } finally {
      setLoading(false);
    }
  };

  const positiveActions = karmaHistory.filter((entry) => entry.karma > 0).length;
  const negativeActions = karmaHistory.filter((entry) => entry.karma < 0).length;

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const todayKarma = sumTodayKarma(karmaHistory);
  const weeklyKarma = sumWeeklyKarma(karmaHistory);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <KarmaHeroCircle karma={user.karma} todayKarma={todayKarma} dailyGoal={user.karmaDailyGoal} animKey={animKey} />
        <KarmaSectionTitle title="Your karma" subtitle="Keep doing good deeds" />
        <KarmaDailyGoalCard todayKarma={todayKarma} dailyGoal={user.karmaDailyGoal} animKey={animKey} />
        <KarmaStatsRow goodCount={positiveActions} badCount={negativeActions} />
        <KarmaWeeklyCard weeklyTotal={weeklyKarma} />

        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => setHistoryVisible(true)}
          activeOpacity={0.75}
        >
          <View style={styles.historyBtnLeft}>
            <Ionicons name="time" size={20} color={COLORS.primary} />
            <Text style={styles.historyBtnText}>Karma History</Text>
          </View>
          <Ionicons name="chevron-up" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        <KarmaRecentActions entries={karmaHistory.slice(0, 5)} />
      </ScrollView>

      <KarmaHistorySheet
        visible={historyVisible}
        totalKarma={user.karma}
        entries={karmaHistory}
        onClose={() => setHistoryVisible(false)}
      />
    </View>
  );
}
