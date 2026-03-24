import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';
import { getKarmaLevelLabel } from '../../utils/karmaLevel';

const { width } = Dimensions.get('window');

interface Props {
  karma: number;
}

export function KarmaHeroCircle({ karma }: Props) {
  const { colors: COLORS } = useTheme();
  const karmaLevel = getKarmaLevelLabel(karma, COLORS);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        karmaCircleContainer: {
          alignItems: 'center',
          marginBottom: 24,
          position: 'relative',
        },
        karmaCircle: {
          width: width * 0.6,
          height: width * 0.6,
          borderRadius: (width * 0.6) / 2,
          backgroundColor: COLORS.surface,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 8,
          borderColor: COLORS.lightGray,
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        },
        decorativeCircle: {
          position: 'absolute',
          width: 24,
          height: 24,
          borderRadius: 12,
        },
        decorativeCircle1: {
          top: -4,
          right: width * 0.1,
          backgroundColor: COLORS.warning,
        },
        decorativeCircle2: {
          bottom: -4,
          left: width * 0.1,
          backgroundColor: COLORS.secondary,
        },
        karmaValue: { fontSize: 64, fontFamily: FONT.bold },
        karmaLevel: { fontSize: 18, fontFamily: FONT.semibold, marginTop: 8 },
      }),
    [COLORS]
  );

  return (
    <View style={styles.karmaCircleContainer}>
      <View style={styles.karmaCircle}>
        <Text style={[styles.karmaValue, { color: karma >= 0 ? COLORS.primary : COLORS.error }]}>
          {karma}
        </Text>
        <Text style={[styles.karmaLevel, { color: karmaLevel.color }]}>{karmaLevel.level}</Text>
      </View>
      <View style={[styles.decorativeCircle, styles.decorativeCircle1]} />
      <View style={[styles.decorativeCircle, styles.decorativeCircle2]} />
    </View>
  );
}
