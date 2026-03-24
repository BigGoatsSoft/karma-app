import React, { ReactNode, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  valueLabel: string;
  expanded: boolean;
  onPress: () => void;
  children?: ReactNode;
}

export function SettingsExpandableRow({
  icon,
  label,
  description,
  valueLabel,
  expanded,
  onPress,
  children,
}: Props) {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        settingItem: {
          backgroundColor: COLORS.surface,
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        },
        settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
        settingLabel: { fontSize: 16, color: COLORS.textPrimary, fontFamily: FONT.medium },
        settingDescription: {
          fontSize: 12,
          color: COLORS.textMuted,
          fontFamily: FONT.regular,
          marginTop: 2,
        },
        settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
        settingValue: { fontSize: 14, color: COLORS.textMuted, fontFamily: FONT.regular },
      }),
    [COLORS]
  );

  return (
    <>
      <TouchableOpacity style={styles.settingItem} onPress={onPress} accessibilityRole="button">
        <View style={styles.settingLeft}>
          <Ionicons name={icon} size={20} color={COLORS.primary} />
          {description ? (
            <View>
              <Text style={styles.settingLabel}>{label}</Text>
              <Text style={styles.settingDescription}>{description}</Text>
            </View>
          ) : (
            <Text style={styles.settingLabel}>{label}</Text>
          )}
        </View>
        <View style={styles.settingRight}>
          <Text style={styles.settingValue}>{valueLabel}</Text>
          <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
        </View>
      </TouchableOpacity>
      {expanded ? children : null}
    </>
  );
}
