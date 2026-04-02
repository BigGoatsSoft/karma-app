import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';
import type { ApiErrorBody } from '../types/api';
import type {
  AuthResponse,
  KarmaResponse,
  LoginRequest,
  SignUpRequest,
  UpdateUserRequest,
  User,
} from '../types';

let onUnauthorized: (() => void) | null = null;

/** Register a callback that will be invoked when the session is definitely expired. */
export function setOnUnauthorized(cb: (() => void) | null) {
  onUnauthorized = cb;
}

// --- Token refresh queue ---
// When a token refresh is in-flight, queue other 401 requests so they all
// retry with the new token instead of each triggering a separate refresh.
let isRefreshing = false;
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void };
let queue: QueueEntry[] = [];

function flushQueue(err: unknown, token: string | null) {
  queue.forEach((entry) => (err ? entry.reject(err) : entry.resolve(token!)));
  queue = [];
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Attach access token to every request
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // On 401: try silent token refresh before giving up
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorBody>) => {
        const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status !== 401 || original._retry) {
          return Promise.reject(error);
        }

        // Don't try to refresh the refresh call itself (avoid infinite loop)
        if (original.url?.includes('/refresh-token')) {
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
          onUnauthorized?.();
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // Park this request until the ongoing refresh resolves
          return new Promise<string>((resolve, reject) => {
            queue.push({ resolve, reject });
          })
            .then((newToken) => {
              original.headers.Authorization = `Bearer ${newToken}`;
              return this.api(original);
            })
            .catch((err) => Promise.reject(err));
        }

        original._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('no_refresh_token');

          const { data } = await this.api.post<AuthResponse>('/refresh-token', { refreshToken });

          await AsyncStorage.setItem('accessToken', data.accessToken);
          if (data.refreshToken) {
            await AsyncStorage.setItem('refreshToken', data.refreshToken);
          }

          flushQueue(null, data.accessToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return this.api(original);
        } catch (refreshError) {
          flushQueue(refreshError, null);
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
          onUnauthorized?.();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    );
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.api.post<AuthResponse>('/login', { email, password } satisfies LoginRequest);
    return data;
  }

  async signUp(email: string, name: string, password: string): Promise<AuthResponse> {
    const body: SignUpRequest = { email, name, password };
    const { data } = await this.api.post<AuthResponse>('/signUp', body);
    return data;
  }

  async loginWithGoogle(accessTokenGoogle: string): Promise<AuthResponse> {
    const { data } = await this.api.post<AuthResponse>('/loginWithGoogle', { accessTokenGoogle });
    return data;
  }

  async getUser(): Promise<User> {
    const { data } = await this.api.get<User>('/getUser');
    return data;
  }

  async updateUser(body: UpdateUserRequest): Promise<User> {
    const { data } = await this.api.patch<User>('/updateUser', body);
    return data;
  }

  async getUserKarma(): Promise<KarmaResponse[]> {
    const { data } = await this.api.get<KarmaResponse[]>('/getUserKarma');
    return data;
  }

  async getKarma(text: string): Promise<KarmaResponse> {
    const { data } = await this.api.post<KarmaResponse>('/getKarma', { text });
    return data;
  }
}

export default new ApiService();
