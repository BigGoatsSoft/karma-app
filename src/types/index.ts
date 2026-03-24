export interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  botPersonality: 'neutral' | 'encouraging' | 'strict';
  karmaDailyGoal: number;
  karma: number;
  isNotificationReminder: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface KarmaRequest {
  text: string;
}

export interface KarmaResponse {
  id: number;
  karma: number;
  text: string;
  createdAt: string;
}

export interface UpdateUserRequest {
  country?: string;
  botPersonality?: 'neutral' | 'encouraging' | 'strict';
  karmaDailyGoal?: number;
  isNotificationReminder?: boolean;
}

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Chat: undefined;
  Karma: undefined;
  Settings: undefined;
};
