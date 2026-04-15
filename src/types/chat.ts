import type { KarmaResponse } from './index';

export interface ChatMessage extends Omit<KarmaResponse, 'id'> {
  id: string;
  isUser: boolean;
}
