import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage } from '../types/chat';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

/** Per-user keys so Apple / Google / email accounts do not share one device cache. */
function sessionsKey(userId: string) {
  return `@karma_chat_sessions_${userId}`;
}

function currentSessionIdKey(userId: string) {
  return `@karma_current_session_id_${userId}`;
}

export async function loadSessions(userId: string): Promise<ChatSession[]> {
  try {
    const raw = await AsyncStorage.getItem(sessionsKey(userId));
    return raw ? (JSON.parse(raw) as ChatSession[]) : [];
  } catch {
    return [];
  }
}

export async function upsertSession(userId: string, session: ChatSession): Promise<void> {
  try {
    const all = await loadSessions(userId);
    const idx = all.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      all[idx] = session;
    } else {
      all.unshift(session);
    }
    await AsyncStorage.setItem(sessionsKey(userId), JSON.stringify(all));
  } catch {
    // ignore storage errors
  }
}

export async function loadCurrentSessionId(userId: string): Promise<string | null> {
  return AsyncStorage.getItem(currentSessionIdKey(userId));
}

export async function saveCurrentSessionId(userId: string, id: string): Promise<void> {
  await AsyncStorage.setItem(currentSessionIdKey(userId), id);
}

export function createSession(messages: ChatMessage[] = []): ChatSession {
  const firstUserMsg = messages.find((m) => m.isUser);
  const title = firstUserMsg ? firstUserMsg.text.slice(0, 45) : 'New Chat';
  return {
    id: `session-${Date.now()}`,
    title,
    createdAt: new Date().toISOString(),
    messages,
  };
}

export function formatSessionDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}
