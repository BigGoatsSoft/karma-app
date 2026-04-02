import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../../constants/fonts';
import { useTheme } from '../../contexts/ThemeContext';
import type { ChatMessage } from '../../types/chat';

interface Props {
  item: ChatMessage;
}

export function ChatMessageBubble({ item }: Props) {
  const { colors: COLORS } = useTheme();

  const karmaAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!item.isUser && item.karma !== 0) {
      karmaAnim.setValue(0);
      Animated.spring(karmaAnim, {
        toValue: 1,
        delay: 180,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }).start();
    }
  }, [item.id]);

  const karmaAnimStyle = {
    opacity: karmaAnim,
    transform: [
      {
        translateY: karmaAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [6, 0],
        }),
      },
      {
        scale: karmaAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.85, 1],
        }),
      },
    ],
  };

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
          alignSelf: 'flex-start',
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 20,
        },
        karmaPositive: {
          backgroundColor: `${COLORS.success}18`,
        },
        karmaNegative: {
          backgroundColor: `${COLORS.error}18`,
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
          <Animated.View
            style={[
              styles.karmaContainer,
              item.karma > 0 ? styles.karmaPositive : styles.karmaNegative,
              karmaAnimStyle,
            ]}
          >
            <Ionicons
              name={item.karma > 0 ? 'arrow-up-circle' : 'arrow-down-circle'}
              size={15}
              color={item.karma > 0 ? COLORS.success : COLORS.error}
            />
            <Text
              style={[styles.karmaText, { color: item.karma > 0 ? COLORS.success : COLORS.error }]}
            >
              {item.karma > 0 ? '+' : ''}
              {item.karma} karma
            </Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
