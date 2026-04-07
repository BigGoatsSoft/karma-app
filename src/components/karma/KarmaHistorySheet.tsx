import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';
import type { KarmaResponse } from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.72;

interface DayEntry {
  date: string;
  karma: number;
  label: string;
}

function formatDayLabel(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function groupByDay(entries: KarmaResponse[]): DayEntry[] {
  const map = new Map<string, number>();
  for (const entry of entries) {
    const date = entry.createdAt.split('T')[0];
    map.set(date, (map.get(date) ?? 0) + entry.karma);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, karma]) => ({ date, karma, label: formatDayLabel(date) }));
}

interface Props {
  visible: boolean;
  totalKarma: number;
  entries: KarmaResponse[];
  onClose: () => void;
}

export function KarmaHistorySheet({ visible, totalKarma, entries, onClose }: Props) {
  const { colors: COLORS } = useTheme();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 200,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SHEET_HEIGHT,
          useNativeDriver: true,
          damping: 22,
          stiffness: 200,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const days = useMemo(() => groupByDay(entries), [entries]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0,0,0,0.45)',
          zIndex: 20,
        },
        sheet: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: SHEET_HEIGHT,
          backgroundColor: COLORS.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          zIndex: 30,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 20,
        },
        handle: {
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: COLORS.lightGray,
          alignSelf: 'center',
          marginTop: 12,
          marginBottom: 4,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.lightGray,
        },
        headerTitle: {
          fontSize: 18,
          fontFamily: FONT.bold,
          color: COLORS.textPrimary,
        },
        closeBtn: {
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: COLORS.surface,
          justifyContent: 'center',
          alignItems: 'center',
        },
        totalCard: {
          marginHorizontal: 20,
          marginTop: 16,
          marginBottom: 8,
          backgroundColor: COLORS.surface,
          borderRadius: 16,
          padding: 20,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        },
        totalLabel: {
          fontSize: 13,
          fontFamily: FONT.regular,
          color: COLORS.textMuted,
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        },
        totalValue: {
          fontSize: 52,
          fontFamily: FONT.bold,
          lineHeight: 58,
        },
        sectionTitle: {
          fontSize: 13,
          fontFamily: FONT.semibold,
          color: COLORS.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginHorizontal: 20,
          marginTop: 16,
          marginBottom: 8,
        },
        list: {
          flex: 1,
        },
        listContent: {
          paddingHorizontal: 20,
          paddingBottom: 40,
        },
        dayRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: COLORS.surface,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 14,
          marginBottom: 8,
        },
        dayLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        dotWrap: {
          width: 36,
          height: 36,
          borderRadius: 18,
          justifyContent: 'center',
          alignItems: 'center',
        },
        dayLabel: {
          fontSize: 15,
          fontFamily: FONT.semibold,
          color: COLORS.textPrimary,
        },
        dayKarma: {
          fontSize: 17,
          fontFamily: FONT.bold,
        },
        emptyWrap: {
          alignItems: 'center',
          paddingVertical: 40,
          gap: 12,
        },
        emptyText: {
          fontSize: 14,
          fontFamily: FONT.regular,
          color: COLORS.textMuted,
        },
      }),
    [COLORS]
  );

  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[styles.overlay, { opacity: overlayOpacity }]}
          pointerEvents={visible ? 'auto' : 'none'}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Karma History</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={18} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Total karma */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total karma</Text>
          <Text style={[styles.totalValue, { color: totalKarma >= 0 ? COLORS.primary : COLORS.error }]}>
            {totalKarma}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>By day</Text>

        <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {days.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="time-outline" size={36} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No karma history yet</Text>
            </View>
          ) : (
            days.map(({ date, karma, label }) => {
              const isPositive = karma >= 0;
              const dotBg = isPositive ? `${COLORS.success}1a` : `${COLORS.error}1a`;
              const dotColor = isPositive ? COLORS.success : COLORS.error;
              return (
                <View key={date} style={styles.dayRow}>
                  <View style={styles.dayLeft}>
                    <View style={[styles.dotWrap, { backgroundColor: dotBg }]}>
                      <Ionicons
                        name={isPositive ? 'trending-up' : 'trending-down'}
                        size={18}
                        color={dotColor}
                      />
                    </View>
                    <Text style={styles.dayLabel}>{label}</Text>
                  </View>
                  <Text style={[styles.dayKarma, { color: dotColor }]}>
                    {karma > 0 ? '+' : ''}{karma}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
      </Animated.View>
    </>
  );
}
