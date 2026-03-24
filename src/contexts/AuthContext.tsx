import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import apiService from '../services/api';
import { User } from '../types';
import { GOOGLE_CLIENT_ID } from '../config/env';

WebBrowser.maybeCompleteAuthSession();

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
    clientId: GOOGLE_CLIENT_ID || 'your-google-client-id',
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    loadStorageData();
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
    } catch (error) {
      console.error('Error fetching user:', error);
      await AsyncStorage.removeItem('accessToken');
      setUser(null);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const response = await apiService.login(email, password);
      await AsyncStorage.setItem('accessToken', response.accessToken);
      await fetchUser();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function signUp(email: string, name: string, password: string) {
    try {
      const response = await apiService.signUp(email, name, password);
      await AsyncStorage.setItem('accessToken', response.accessToken);
      await fetchUser();
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  }

  async function handleGoogleSignIn(googleToken: string) {
    try {
      const response = await apiService.loginWithGoogle(googleToken);
      await AsyncStorage.setItem('accessToken', response.accessToken);
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
      await AsyncStorage.removeItem('accessToken');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

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
