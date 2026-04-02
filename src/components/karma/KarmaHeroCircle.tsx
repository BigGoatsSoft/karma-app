import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';
import { getKarmaLevelLabel } from '../../utils/karmaLevel';

const { width } = Dimensions.get('window');

const SIZE = width * 0.64;
const STROKE_WIDTH = 10;
const RADIUS = (SIZE - STROKE_WIDTH * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  karma: number;
  todayKarma: number;
  dailyGoal: number;
  animKey: number;
}

export function KarmaHeroCircle({ karma, todayKarma, dailyGoal, animKey }: Props) {
  const { colors: COLORS } = useTheme();
  const karmaLevel = getKarmaLevelLabel(karma, COLORS);

  const rawProgress = dailyGoal > 0 ? todayKarma / dailyGoal : 0;
  const clampedProgress = Math.max(0, Math.min(rawProgress, 1));

  const animProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animKey === 0) return;
    animProgress.setValue(0);
    Animated.timing(animProgress, {
      toValue: clampedProgress,
      duration: 1400,
      useNativeDriver: false,
    }).start();
  }, [animKey, clampedProgress]);

  const strokeDashoffset = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const progressPercent = Math.round(clampedProgress * 100);
  const arcColor = clampedProgress >= 1 ? COLORS.success : karmaLevel.color;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          alignItems: 'center',
          marginBottom: 24,
        },
        svgWrapper: {
          width: SIZE,
          height: SIZE,
          alignItems: 'center',
          justifyContent: 'center',
        },
        innerCircle: {
          position: 'absolute',
          width: SIZE - STROKE_WIDTH * 4,
          height: SIZE - STROKE_WIDTH * 4,
          borderRadius: (SIZE - STROKE_WIDTH * 4) / 2,
          backgroundColor: COLORS.surface,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 14,
          elevation: 8,
        },
        karmaValue: {
          fontSize: 60,
          fontFamily: FONT.bold,
          lineHeight: 66,
        },
        karmaLevel: {
          fontSize: 15,
          fontFamily: FONT.semibold,
          marginTop: 4,
        },
        progressLabel: {
          fontSize: 12,
          fontFamily: FONT.regular,
          marginTop: 2,
          opacity: 0.6,
        },
        decorativeCircle: {
          position: 'absolute',
          width: 20,
          height: 20,
          borderRadius: 10,
        },
        decorativeCircle1: {
          top: 4,
          right: width * 0.08,
          backgroundColor: COLORS.warning,
        },
        decorativeCircle2: {
          bottom: 4,
          left: width * 0.08,
          backgroundColor: COLORS.secondary,
        },
      }),
    [COLORS, arcColor]
  );

  return (
    <View style={styles.container}>
      <View style={styles.svgWrapper}>
        <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
          <Defs>
            <LinearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={arcColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={arcColor} stopOpacity="0.5" />
            </LinearGradient>
          </Defs>

          {/* Track */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={COLORS.lightGray}
            strokeWidth={STROKE_WIDTH}
          />

          {/* Animated progress arc */}
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="url(#arcGrad)"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>

        <View style={styles.innerCircle}>
          <Text style={[styles.karmaValue, { color: karma >= 0 ? COLORS.primary : COLORS.error }]}>
            {karma}
          </Text>
          <Text style={[styles.karmaLevel, { color: karmaLevel.color }]}>
            {karmaLevel.level}
          </Text>
          <Text style={[styles.progressLabel, { color: COLORS.textPrimary }]}>
            {progressPercent}% daily goal
          </Text>
        </View>
      </View>

      <View style={[styles.decorativeCircle, styles.decorativeCircle1]} />
      <View style={[styles.decorativeCircle, styles.decorativeCircle2]} />
    </View>
  );
}
