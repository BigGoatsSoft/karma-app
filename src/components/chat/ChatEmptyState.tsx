import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../../constants/fonts';
import { useTheme } from '../../contexts/ThemeContext';

export function ChatEmptyState() {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        emptyContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 60,
        },
        emptyText: {
          fontSize: 20,
          color: COLORS.textPrimary,
          fontFamily: FONT.bold,
          marginTop: 16,
        },
        emptySubtext: {
          fontSize: 14,
          color: COLORS.textMuted,
          fontFamily: FONT.regular,
          textAlign: 'center',
          marginTop: 8,
        },
      }),
    [COLORS]
  );

  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyText}>Start the chat!</Text>
      <Text style={styles.emptySubtext}>
        Tell me what you did,{'\n'}and I will assign karma
      </Text>
    </View>
  );
}
