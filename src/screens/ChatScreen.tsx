import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';
import type { KarmaResponse } from '../types';
import type { ChatMessage } from '../types/chat';
import { ChatMessageBubble } from '../components/chat/ChatMessageBubble';
import { ChatEmptyState } from '../components/chat/ChatEmptyState';
import { ChatComposer } from '../components/chat/ChatComposer';

export default function ChatScreen() {
  const { colors: COLORS } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const { refreshUser } = useAuth();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: COLORS.background },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        },
        messagesList: { padding: 16, flexGrow: 1 },
      }),
    [COLORS]
  );

  useEffect(() => {
    loadKarmaHistory();
  }, []);

  const loadKarmaHistory = async () => {
    try {
      const history = await apiService.getUserKarma();
      const formattedMessages: ChatMessage[] = history.flatMap((entry: KarmaResponse) => [
        { ...entry, id: `user-${entry.id}`, isUser: true },
        { ...entry, id: `bot-${entry.id}`, isUser: false },
      ]);
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading karma history:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      text: inputText,
      karma: 0,
      createdAt: new Date().toISOString(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await apiService.getKarma(inputText);
      const botMessage: ChatMessage = {
        id: response.createdAt,
        text: response.text,
        karma: response.karma,
        createdAt: response.createdAt,
        isUser: false,
      };
      setMessages((prev) => [...prev, botMessage]);
      await refreshUser();
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      Alert.alert('Error', 'Could not send the message');
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <ChatMessageBubble item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={<ChatEmptyState />}
      />
      <ChatComposer
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSendMessage}
        loading={loading}
      />
    </KeyboardAvoidingView>
  );
}
