import React, { useMemo } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';

interface Props {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function PrimaryButton({ title, loading, disabled, onPress }: Props) {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          backgroundColor: COLORS.primary,
          height: 56,
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 8,
        },
        disabled: { opacity: 0.6 },
        text: { color: COLORS.white, fontSize: 16, fontFamily: FONT.bold },
      }),
    [COLORS]
  );

  return (
    <TouchableOpacity
      style={[styles.button, (loading || disabled) && styles.disabled]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
}
