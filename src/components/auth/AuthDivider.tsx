import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';

interface Props {
  label?: string;
}

export function AuthDivider({ label = 'or' }: Props) {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
        line: { flex: 1, height: 1, backgroundColor: COLORS.lightGray },
        text: { marginHorizontal: 16, color: COLORS.textMuted, fontFamily: FONT.regular },
      }),
    [COLORS]
  );

  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.text}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}
