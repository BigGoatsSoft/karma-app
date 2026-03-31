import axios, { AxiosInstance, AxiosError } from 'axios';
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

/** Register a callback that will be invoked whenever the API receives a 401. */
export function setOnUnauthorized(cb: (() => void) | null) {
  onUnauthorized = cb;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

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

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorBody>) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('accessToken');
          onUnauthorized?.();
        }
        return Promise.reject(error);
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
