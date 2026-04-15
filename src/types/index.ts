export interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  botPersonality: 'usual' | 'business' | 'bad_guy';
  karmaDailyGoal: number;
  karma: number;
  isNotificationReminder: boolean;
  karmaCoins: number;
  subscriptionType: string;
  subscriptionExpiry?: string | null;
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
  refreshToken?: string;
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
  botPersonality?: 'usual' | 'business' | 'bad_guy';
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
