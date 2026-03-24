import type { KarmaResponse } from './index';

export interface ChatMessage extends KarmaResponse {
  isUser: boolean;
}
