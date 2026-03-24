import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';

interface Props {
  onBack: () => void;
}

export function SignUpHeader({ onBack }: Props) {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: { marginBottom: 48 },
        backButton: { width: 40, height: 40, justifyContent: 'center', marginBottom: 24 },
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
      <TouchableOpacity style={styles.backButton} onPress={onBack} accessibilityRole="button">
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>Sign up</Text>
      <Text style={styles.subtitle}>Create an account to get started</Text>
    </View>
  );
}
