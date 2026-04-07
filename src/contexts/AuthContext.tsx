import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import apiService, { setOnUnauthorized } from '../services/api';
import { User } from '../types';
import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from '../config/env';

WebBrowser.maybeCompleteAuthSession();

// On iOS, Google's iOS OAuth client pre-authorises the reversed-client-id scheme.
// We derive it from the client ID: "279743954969-xxx.apps.googleusercontent.com"
//                                → "com.googleusercontent.apps.279743954969-xxx:/oauth2redirect"
// On Android, use the bundle ID-based scheme via makeRedirectUri.
const iosClientIdReversed = GOOGLE_IOS_CLIENT_ID
  ? `com.googleusercontent.apps.${GOOGLE_IOS_CLIENT_ID.replace('.apps.googleusercontent.com', '')}`
  : undefined;

const redirectUri = Platform.select({
  ios: iosClientIdReversed
    ? `${iosClientIdReversed}:/oauth2redirect`
    : makeRedirectUri({ scheme: 'karma-tracker' }),
  default: makeRedirectUri({ scheme: 'karma-tracker' }),
}) ?? makeRedirectUri({ scheme: 'karma-tracker' });


interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, name: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserData: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID || GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID || GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || GOOGLE_CLIENT_ID,
    scopes: ['profile', 'email'],
    redirectUri,
  });

  // Keep a ref so the 401 callback always calls the latest signOut
  const signOutRef = useRef<(() => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    loadStorageData();
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => signOutRef.current?.());
    return () => setOnUnauthorized(null);
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleSignIn(authentication?.accessToken || '');
    }
  }, [response]);

  async function loadStorageData() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        await fetchUser();
      }
    } catch (error) {
      console.error('Error loading storage data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUser() {
    try {
      const userData = await apiService.getUser();
      setUser(userData);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        // Token is truly invalid/expired and refresh already failed inside the interceptor
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        setUser(null);
      }
      // For network errors (ECONNRESET, timeout) or 5xx — keep the user logged in,
      // the session is still valid; just log for debugging.
      console.error('Error fetching user (status=%s):', status ?? 'network', error);
    }
  }

  async function storeTokens(response: { accessToken: string; refreshToken?: string }) {
    await AsyncStorage.setItem('accessToken', response.accessToken);
    if (response.refreshToken) {
      await AsyncStorage.setItem('refreshToken', response.refreshToken);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const response = await apiService.login(email, password);
      await storeTokens(response);
      await fetchUser();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function signUp(email: string, name: string, password: string) {
    try {
      const response = await apiService.signUp(email, name, password);
      await storeTokens(response);
      await fetchUser();
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  }

  async function handleGoogleSignIn(googleToken: string) {
    try {
      const response = await apiService.loginWithGoogle(googleToken);
      await storeTokens(response);
      await fetchUser();
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  async function signInWithGoogle() {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  async function signOut() {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setUser(null);
    }
  }

  signOutRef.current = signOut;

  function updateUserData(data: Partial<User>) {
    if (user) {
      setUser({ ...user, ...data });
    }
  }

  async function refreshUser() {
    await fetchUser();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateUserData,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
