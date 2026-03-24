import React, { ReactNode, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';

interface Props extends Omit<TextInputProps, 'style'> {
  icon: keyof typeof Ionicons.glyphMap;
  rightAccessory?: ReactNode;
}

export function FormTextField({ icon, rightAccessory, ...inputProps }: Props) {
  const { colors: COLORS } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.surface,
          borderRadius: 12,
          paddingHorizontal: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: COLORS.lightGray,
        },
        inputIcon: { marginRight: 12 },
        input: {
          flex: 1,
          height: 56,
          fontSize: 16,
          color: COLORS.textPrimary,
          fontFamily: FONT.regular,
        },
      }),
    [COLORS]
  );

  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={COLORS.textMuted} style={styles.inputIcon} />
      <TextInput style={styles.input} placeholderTextColor={COLORS.textMuted} {...inputProps} />
      {rightAccessory}
    </View>
  );
}

export function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  const { colors: COLORS } = useTheme();
  return (
    <TouchableOpacity onPress={onToggle} accessibilityRole="button">
      <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}
