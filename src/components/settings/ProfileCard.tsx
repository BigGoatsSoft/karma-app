import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';

interface Props {
  name: string;
  email: string;
}

export function ProfileCard({ name, email }: Props) {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        userCard: {
          backgroundColor: COLORS.surface,
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          marginBottom: 24,
        },
        avatar: {
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: COLORS.primary,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12,
        },
        avatarText: { fontSize: 32, color: COLORS.white, fontFamily: FONT.bold },
        userName: {
          fontSize: 20,
          color: COLORS.textPrimary,
          fontFamily: FONT.bold,
          marginBottom: 4,
        },
        userEmail: { fontSize: 14, color: COLORS.textMuted, fontFamily: FONT.regular },
      }),
    [COLORS]
  );

  return (
    <View style={styles.userCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={styles.userName}>{name}</Text>
      <Text style={styles.userEmail}>{email}</Text>
    </View>
  );
}
