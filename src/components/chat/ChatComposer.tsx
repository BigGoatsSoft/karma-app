import React, { useMemo } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../../constants/fonts';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  loading: boolean;
}

export function ChatComposer({ value, onChangeText, onSend, loading }: Props) {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        inputContainer: {
          flexDirection: 'row',
          padding: 16,
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.lightGray,
          alignItems: 'flex-end',
          gap: 12,
        },
        input: {
          flex: 1,
          backgroundColor: COLORS.background,
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 10,
          fontSize: 15,
          fontFamily: FONT.regular,
          color: COLORS.textPrimary,
          maxHeight: 100,
        },
        sendButton: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: COLORS.primary,
          justifyContent: 'center',
          alignItems: 'center',
        },
        sendButtonDisabled: { opacity: 0.5 },
      }),
    [COLORS]
  );

  const canSend = value.trim().length > 0 && !loading;

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Describe what you did..."
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={!canSend}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Ionicons name="send" size={20} color={COLORS.white} />
        )}
      </TouchableOpacity>
    </View>
  );
}
