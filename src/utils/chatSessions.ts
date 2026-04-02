import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage } from '../types/chat';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

const SESSIONS_KEY = '@karma_chat_sessions';
const CURRENT_ID_KEY = '@karma_current_session_id';

export async function loadSessions(): Promise<ChatSession[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as ChatSession[]) : [];
  } catch {
    return [];
  }
}

export async function upsertSession(session: ChatSession): Promise<void> {
  try {
    const all = await loadSessions();
    const idx = all.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      all[idx] = session;
    } else {
      all.unshift(session);
    }
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
  } catch {
    // ignore storage errors
  }
}

export async function loadCurrentSessionId(): Promise<string | null> {
  return AsyncStorage.getItem(CURRENT_ID_KEY);
}

export async function saveCurrentSessionId(id: string): Promise<void> {
  await AsyncStorage.setItem(CURRENT_ID_KEY, id);
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
