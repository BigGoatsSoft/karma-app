import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FONT } from '../constants/fonts';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getApiErrorMessage } from '../utils/apiError';
import { AuthScreenLayout } from '../components/auth/AuthScreenLayout';
import { LoginHeader } from '../components/auth/LoginHeader';
import { FormTextField, PasswordToggle } from '../components/auth/FormTextField';
import { PrimaryButton } from '../components/auth/PrimaryButton';
import { AuthDivider } from '../components/auth/AuthDivider';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
  const { colors: COLORS } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        form: { width: '100%' },
        googleButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.surface,
          height: 56,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: COLORS.primary,
          gap: 8,
        },
        googleButtonText: {
          color: COLORS.primary,
          fontSize: 16,
          fontFamily: FONT.semibold,
        },
        appleButton: { height: 56, marginTop: 12, borderRadius: 12, overflow: 'hidden' },
        signUpLink: { marginTop: 24, alignItems: 'center' },
        signUpLinkText: { color: COLORS.textMuted, fontSize: 14, fontFamily: FONT.regular },
        signUpLinkBold: { color: COLORS.primary, fontFamily: FONT.bold },
      }),
    [COLORS]
  );

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: unknown) {
      Alert.alert(
        'Sign-in error',
        getApiErrorMessage(error, 'Check your credentials and try again')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      Alert.alert('Error', 'Could not sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    try {
      await signInWithApple();
    } catch (error: unknown) {
      Alert.alert('Error', getApiErrorMessage(error, 'Could not sign in with Apple'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <LoginHeader />
      <View style={styles.form}>
        <FormTextField
          icon="mail-outline"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <FormTextField
          icon="lock-closed-outline"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          rightAccessory={
            <PasswordToggle visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
          }
        />
        <PrimaryButton title="Sign in" loading={loading} onPress={handleLogin} />
        <AuthDivider />
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={20} color={COLORS.primary} />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>
        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={styles.appleButton}
            onPress={handleAppleLogin}
          />
        )}
        <TouchableOpacity
          style={styles.signUpLink}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.signUpLinkText}>
            Don't have an account? <Text style={styles.signUpLinkBold}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreenLayout>
  );
}
