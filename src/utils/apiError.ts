import { AxiosError } from 'axios';
import type { ApiErrorBody } from '../types/api';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const ax = error as AxiosError<ApiErrorBody>;
    const msg = ax.response?.data?.message;
    if (typeof msg === 'string' && msg.length > 0) return msg;
    if (Array.isArray(msg) && msg.length > 0) return msg[0];
  }
  return fallback;
}
