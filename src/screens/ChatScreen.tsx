import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';
import type { KarmaResponse, User } from '../types';
import type { ChatMessage } from '../types/chat';
import { FONT } from '../constants/fonts';
import { ChatMessageBubble } from '../components/chat/ChatMessageBubble';
import { ChatEmptyState } from '../components/chat/ChatEmptyState';
import { ChatComposer } from '../components/chat/ChatComposer';
import { ChatHistoryDrawer } from '../components/chat/ChatHistoryDrawer';
import { SubscriptionModal } from '../components/subscription/SubscriptionModal';
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
  const [newChatConfirmVisible, setNewChatConfirmVisible] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [outOfCoins, setOutOfCoins] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { user, refreshUser, updateUserData } = useAuth();

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
        // Confirm modal
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'flex-end',
        },
        confirmSheet: {
          backgroundColor: COLORS.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 20,
          paddingBottom: 36,
          paddingTop: 6,
        },
        confirmHandle: {
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: COLORS.lightGray,
          alignSelf: 'center',
          marginBottom: 20,
          marginTop: 12,
        },
        confirmTitle: {
          fontSize: 18,
          fontFamily: FONT.bold,
          color: COLORS.textPrimary,
          marginBottom: 6,
        },
        confirmSubtitle: {
          fontSize: 14,
          fontFamily: FONT.regular,
          color: COLORS.textMuted,
          marginBottom: 24,
        },
        confirmBtnPrimary: {
          backgroundColor: COLORS.primary,
          borderRadius: 14,
          paddingVertical: 14,
          alignItems: 'center',
          marginBottom: 10,
        },
        confirmBtnPrimaryText: {
          fontSize: 16,
          fontFamily: FONT.semibold,
          color: COLORS.white,
        },
        confirmBtnCancel: {
          backgroundColor: COLORS.surface,
          borderRadius: 14,
          paddingVertical: 14,
          alignItems: 'center',
        },
        confirmBtnCancelText: {
          fontSize: 16,
          fontFamily: FONT.semibold,
          color: COLORS.textPrimary,
        },
      }),
    [COLORS]
  );

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    let cancelled = false;
    (async () => {
      setInitialLoading(true);
      try {
        const [savedSessions, currentId, serverHistory] = await Promise.all([
          loadSessions(userId),
          loadCurrentSessionId(userId),
          apiService.getUserKarma().catch(() => [] as KarmaResponse[]),
        ]);
        if (cancelled) return;

        if (savedSessions.length === 0) {
          const formattedMessages: ChatMessage[] = serverHistory.flatMap((entry: KarmaResponse) => [
            { ...entry, id: `user-${entry.id}`, isUser: true },
            { ...entry, id: `bot-${entry.id}`, isUser: false },
          ]);
          const initialSession = createSession(formattedMessages);
          await upsertSession(userId, initialSession);
          await saveCurrentSessionId(userId, initialSession.id);
          if (cancelled) return;
          setSessions([initialSession]);
          setCurrentSession(initialSession);
          setMessages(formattedMessages);
        } else {
          const active = savedSessions.find((s) => s.id === currentId) ?? savedSessions[0];
          setSessions(savedSessions);
          setCurrentSession(active);
          setMessages(active.messages);
        }
      } catch (error) {
        console.error('Error initialising sessions:', error);
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const userId = user?.id;

  const persistCurrentSession = async (session: ChatSession, updatedMessages: ChatMessage[]) => {
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
    if (!userId) return;
    await upsertSession(userId, updated);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || loading || !currentSession || !userId) return;

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
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      if (status === 402) {
        setOutOfCoins(true);
        setSubscriptionModalVisible(true);
      } else {
        Alert.alert('Error', 'Could not send the message');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewChatRequest = () => {
    if (messages.length === 0) return;
    setNewChatConfirmVisible(true);
  };

  const confirmNewChat = async () => {
    if (!userId) return;
    setNewChatConfirmVisible(false);
    if (currentSession) {
      await persistCurrentSession(currentSession, messages);
    }
    const newSession = createSession();
    await upsertSession(userId, newSession);
    await saveCurrentSessionId(userId, newSession.id);
    setCurrentSession(newSession);
    setSessions((prev) => [newSession, ...prev.filter((s) => s.id !== newSession.id)]);
    setMessages([]);
    setDrawerOpen(false);
  };

  const handleSelectSession = async (session: ChatSession) => {
    if (!userId) return;
    if (currentSession && currentSession.id !== session.id) {
      await persistCurrentSession(currentSession, messages);
    }
    await saveCurrentSessionId(userId, session.id);
    setCurrentSession(session);
    setMessages(session.messages);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 50);
  };

  const handlePersonalityChange = async (p: User['botPersonality']) => {
    try {
      await apiService.updateUser({ botPersonality: p });
      updateUserData({ botPersonality: p });
    } catch {
      Alert.alert('Error', 'Could not update personality');
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
          onNewChat={handleNewChatRequest}
          personality={user?.botPersonality ?? 'usual'}
          onPersonalityChange={handlePersonalityChange}
          karmaCoins={user?.karmaCoins ?? 0}
          subscriptionType={user?.subscriptionType ?? 'free'}
          onUpgradePress={() => { setOutOfCoins(false); setSubscriptionModalVisible(true); }}
        />
      </KeyboardAvoidingView>

      <SubscriptionModal
        visible={subscriptionModalVisible}
        outOfCoins={outOfCoins}
        onClose={() => setSubscriptionModalVisible(false)}
      />

      {/* New Chat confirmation */}
      <Modal
        visible={newChatConfirmVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNewChatConfirmVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setNewChatConfirmVisible(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()} style={styles.confirmSheet}>
            <View style={styles.confirmHandle} />
            <Text style={styles.confirmTitle}>Start a new chat?</Text>
            <Text style={styles.confirmSubtitle}>
              The current conversation will be saved in history.
            </Text>
            <TouchableOpacity style={styles.confirmBtnPrimary} onPress={confirmNewChat} activeOpacity={0.8}>
              <Text style={styles.confirmBtnPrimaryText}>New Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtnCancel}
              onPress={() => setNewChatConfirmVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
