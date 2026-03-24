import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';

interface Props {
  title: string;
  subtitle: string;
}

export function KarmaSectionTitle({ title, subtitle }: Props) {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        sectionTitle: {
          fontSize: 24,
          color: COLORS.textPrimary,
          fontFamily: FONT.bold,
          textAlign: 'center',
          marginBottom: 8,
        },
        sectionSubtitle: {
          fontSize: 14,
          color: COLORS.textMuted,
          fontFamily: FONT.regular,
          textAlign: 'center',
          marginBottom: 24,
        },
      }),
    [COLORS]
  );

  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </>
  );
}
