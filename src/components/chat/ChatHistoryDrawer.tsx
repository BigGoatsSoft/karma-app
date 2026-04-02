import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FONT } from '../../constants/fonts';
import type { ChatSession } from '../../utils/chatSessions';
import { formatSessionDate } from '../../utils/chatSessions';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.78;

interface Props {
  visible: boolean;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onClose: () => void;
}

export function ChatHistoryDrawer({
  visible,
  sessions,
  currentSessionId,
  onSelectSession,
  onClose,
}: Props) {
  const { colors: COLORS } = useTheme();
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 180,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: -DRAWER_WIDTH,
          useNativeDriver: true,
          damping: 20,
          stiffness: 180,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0,0,0,0.45)',
          zIndex: 10,
        },
        drawer: {
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: DRAWER_WIDTH,
          backgroundColor: COLORS.surface,
          zIndex: 20,
          shadowColor: COLORS.black,
          shadowOffset: { width: 4, height: 0 },
          shadowOpacity: 0.18,
          shadowRadius: 12,
          elevation: 16,
        },
        header: {
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.lightGray,
        },
        headerTitle: {
          fontSize: 18,
          fontFamily: FONT.bold,
          color: COLORS.textPrimary,
        },
        headerSub: {
          fontSize: 12,
          fontFamily: FONT.regular,
          color: COLORS.textMuted,
          marginTop: 2,
        },
        list: {
          flex: 1,
        },
        listContent: {
          paddingVertical: 8,
        },
        sessionItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 13,
          marginHorizontal: 8,
          marginVertical: 2,
          borderRadius: 12,
          gap: 12,
        },
        sessionItemActive: {
          backgroundColor: COLORS.lightGray,
        },
        iconWrap: {
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: COLORS.background,
          justifyContent: 'center',
          alignItems: 'center',
        },
        sessionTextWrap: {
          flex: 1,
        },
        sessionTitle: {
          fontSize: 14,
          fontFamily: FONT.semibold,
          color: COLORS.textPrimary,
        },
        sessionDate: {
          fontSize: 12,
          fontFamily: FONT.regular,
          color: COLORS.textMuted,
          marginTop: 2,
        },
        emptyWrap: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 48,
        },
        emptyText: {
          fontSize: 14,
          fontFamily: FONT.regular,
          color: COLORS.textMuted,
          marginTop: 12,
          textAlign: 'center',
        },
      }),
    [COLORS]
  );

  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[styles.overlay, { opacity: overlayOpacity }]}
          pointerEvents={visible ? 'auto' : 'none'}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.drawer, { transform: [{ translateX }] }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat History</Text>
          <Text style={styles.headerSub}>{sessions.length} conversation{sessions.length !== 1 ? 's' : ''}</Text>
        </View>

        {sessions.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="chatbubbles-outline" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No saved chats yet</Text>
          </View>
        ) : (
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isActive = item.id === currentSessionId;
              return (
                <TouchableOpacity
                  style={[styles.sessionItem, isActive && styles.sessionItemActive]}
                  onPress={() => {
                    onSelectSession(item);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconWrap}>
                    <Ionicons
                      name={isActive ? 'chatbubbles' : 'chatbubbles-outline'}
                      size={18}
                      color={isActive ? COLORS.primary : COLORS.textMuted}
                    />
                  </View>
                  <View style={styles.sessionTextWrap}>
                    <Text style={styles.sessionTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.sessionDate}>{formatSessionDate(item.createdAt)}</Text>
                  </View>
                  {isActive && (
                    <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </Animated.View>
    </>
  );
}
