import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';
import type { KarmaResponse } from '../types';
import type { ChatMessage } from '../types/chat';
import { ChatMessageBubble } from '../components/chat/ChatMessageBubble';
import { ChatEmptyState } from '../components/chat/ChatEmptyState';
import { ChatComposer } from '../components/chat/ChatComposer';
import { ChatHistoryDrawer } from '../components/chat/ChatHistoryDrawer';
import {
  type ChatSession,
  loadSessions,
  upsertSession,
  loadCurrentSessionId,
  saveCurrentSessionId,
  createSession,
} from '../utils/chatSessions';

export default function ChatScreen() {
  const { colors: COLORS } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { refreshUser } = useAuth();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: { flex: 1 },
        container: { flex: 1, backgroundColor: COLORS.background },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        },
        messagesList: { padding: 16, flexGrow: 1 },
        chatArea: { flex: 1 },
        floatingBtn: {
          position: 'absolute',
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: COLORS.primary,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.22,
          shadowRadius: 6,
          elevation: 5,
          zIndex: 5,
        },
        historyBtn: {
          top: 16,
          left: 16,
        },
        newChatBtn: {
          bottom: 16,
          left: 16,
        },
      }),
    [COLORS]
  );

  useEffect(() => {
    initSessions();
  }, []);

  const initSessions = async () => {
    try {
      const [savedSessions, currentId, serverHistory] = await Promise.all([
        loadSessions(),
        loadCurrentSessionId(),
        apiService.getUserKarma().catch(() => [] as KarmaResponse[]),
      ]);

      if (savedSessions.length === 0) {
        // First launch — seed from server history
        const formattedMessages: ChatMessage[] = serverHistory.flatMap((entry: KarmaResponse) => [
          { ...entry, id: `user-${entry.id}`, isUser: true },
          { ...entry, id: `bot-${entry.id}`, isUser: false },
        ]);
        const initialSession = createSession(formattedMessages);
        await upsertSession(initialSession);
        await saveCurrentSessionId(initialSession.id);
        setSessions([initialSession]);
        setCurrentSession(initialSession);
        setMessages(formattedMessages);
      } else {
        const active =
          savedSessions.find((s) => s.id === currentId) ?? savedSessions[0];
        setSessions(savedSessions);
        setCurrentSession(active);
        setMessages(active.messages);
      }
    } catch (error) {
      console.error('Error initialising sessions:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const persistCurrentSession = async (
    session: ChatSession,
    updatedMessages: ChatMessage[]
  ) => {
    const firstUserMsg = updatedMessages.find((m) => m.isUser);
    const updated: ChatSession = {
      ...session,
      title: firstUserMsg ? firstUserMsg.text.slice(0, 45) : session.title,
      messages: updatedMessages,
    };
    setCurrentSession(updated);
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });
    await upsertSession(updated);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || loading || !currentSession) return;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      text: inputText,
      karma: 0,
      createdAt: new Date().toISOString(),
      isUser: true,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
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
      const finalMessages = [...nextMessages, botMessage];
      setMessages(finalMessages);
      await persistCurrentSession(currentSession, finalMessages);
      await refreshUser();
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      Alert.alert('Error', 'Could not send the message');
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    // If the current chat is already empty, there's nothing to start fresh from
    if (messages.length === 0) return;

    if (currentSession) {
      await persistCurrentSession(currentSession, messages);
    }
    const newSession = createSession();
    await upsertSession(newSession);
    await saveCurrentSessionId(newSession.id);
    setCurrentSession(newSession);
    setSessions((prev) => [newSession, ...prev.filter((s) => s.id !== newSession.id)]);
    setMessages([]);
    setDrawerOpen(false);
  };

  const handleSelectSession = async (session: ChatSession) => {
    if (currentSession && currentSession.id !== session.id) {
      await persistCurrentSession(currentSession, messages);
    }
    await saveCurrentSessionId(session.id);
    setCurrentSession(session);
    setMessages(session.messages);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 50);
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={100}
      >
        <View style={styles.chatArea}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => <ChatMessageBubble item={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            ListEmptyComponent={<ChatEmptyState />}
          />

          {/* History button — top left */}
          <TouchableOpacity
            style={[styles.floatingBtn, styles.historyBtn]}
            onPress={() => setDrawerOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>

          {/* New Chat button — bottom left */}
          <TouchableOpacity
            style={[styles.floatingBtn, styles.newChatBtn]}
            onPress={handleNewChat}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>

          {/* Drawer and overlay rendered inside chatArea so they respect KAV */}
          <ChatHistoryDrawer
            visible={drawerOpen}
            sessions={sessions}
            currentSessionId={currentSession?.id ?? null}
            onSelectSession={handleSelectSession}
            onClose={() => setDrawerOpen(false)}
          />
        </View>

        <ChatComposer
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSendMessage}
          loading={loading}
        />
      </KeyboardAvoidingView>
    </View>
  );
}
