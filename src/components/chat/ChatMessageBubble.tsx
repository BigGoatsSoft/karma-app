import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../../constants/fonts';
import { useTheme } from '../../contexts/ThemeContext';
import type { ChatMessage } from '../../types/chat';

interface Props {
  item: ChatMessage;
}

export function ChatMessageBubble({ item }: Props) {
  const { colors: COLORS } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        messageContainer: { marginBottom: 12 },
        userMessage: { alignItems: 'flex-end' },
        botMessage: { alignItems: 'flex-start' },
        messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
        userBubble: {
          backgroundColor: COLORS.primary,
          borderBottomRightRadius: 4,
        },
        botBubble: {
          backgroundColor: COLORS.surface,
          borderBottomLeftRadius: 4,
        },
        messageText: { fontSize: 15, fontFamily: FONT.regular },
        userText: { color: COLORS.white },
        botText: { color: COLORS.textPrimary },
        karmaContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 8,
          gap: 4,
        },
        karmaText: { fontSize: 13, fontFamily: FONT.semibold },
      }),
    [COLORS]
  );

  return (
    <View
      style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.botMessage]}
    >
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.messageText, item.isUser ? styles.userText : styles.botText]}>
          {item.text}
        </Text>
        {!item.isUser && item.karma !== 0 && (
          <View style={styles.karmaContainer}>
            <Ionicons
              name={item.karma > 0 ? 'arrow-up' : 'arrow-down'}
              size={14}
              color={item.karma > 0 ? COLORS.success : COLORS.error}
            />
            <Text
              style={[styles.karmaText, { color: item.karma > 0 ? COLORS.success : COLORS.error }]}
            >
              {item.karma > 0 ? '+' : ''}
              {item.karma} karma
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
