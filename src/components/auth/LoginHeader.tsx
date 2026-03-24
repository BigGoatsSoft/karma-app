import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';

export function LoginHeader() {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: { alignItems: 'center', marginBottom: 48 },
        logoContainer: {
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: COLORS.lightGray,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
        },
        title: {
          fontSize: 32,
          color: COLORS.primary,
          fontFamily: FONT.bold,
          marginBottom: 8,
        },
        subtitle: { fontSize: 16, color: COLORS.textMuted, fontFamily: FONT.regular },
      }),
    [COLORS]
  );

  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Ionicons name="star" size={60} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>Karma Tracker</Text>
      <Text style={styles.subtitle}>Track your karma</Text>
    </View>
  );
}
