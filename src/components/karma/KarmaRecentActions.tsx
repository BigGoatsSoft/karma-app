import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';
import type { KarmaResponse } from '../../types';

interface Props {
  entries: KarmaResponse[];
}

export function KarmaRecentActions({ entries }: Props) {
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
        cardTitle: {
          fontSize: 16,
          color: COLORS.textPrimary,
          fontFamily: FONT.semibold,
          marginBottom: 4,
        },
        actionItem: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.lightGray,
        },
        actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
        actionText: {
          fontSize: 14,
          color: COLORS.textPrimary,
          fontFamily: FONT.regular,
          flex: 1,
        },
        actionKarma: { fontSize: 16, fontFamily: FONT.bold },
      }),
    [COLORS]
  );

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Recent actions</Text>
      {entries.map((entry) => (
        <View key={entry.id} style={styles.actionItem}>
          <View style={styles.actionLeft}>
            <Ionicons
              name={entry.karma > 0 ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={entry.karma > 0 ? COLORS.success : COLORS.error}
            />
            <Text style={styles.actionText} numberOfLines={1}>
              {entry.text}
            </Text>
          </View>
          <Text style={[styles.actionKarma, { color: entry.karma > 0 ? COLORS.success : COLORS.error }]}>
            {entry.karma > 0 ? '+' : ''}
            {entry.karma}
          </Text>
        </View>
      ))}
    </View>
  );
}
