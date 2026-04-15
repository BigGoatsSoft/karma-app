import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FONT } from '../constants/fonts';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getApiErrorMessage } from '../utils/apiError';
import { AuthScreenLayout } from '../components/auth/AuthScreenLayout';
import { SignUpHeader } from '../components/auth/SignUpHeader';
import { FormTextField, PasswordToggle } from '../components/auth/FormTextField';
import { PrimaryButton } from '../components/auth/PrimaryButton';
import { AuthDivider } from '../components/auth/AuthDivider';

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

interface Props {
  navigation: SignUpScreenNavigationProp;
}

export default function SignUpScreen({ navigation }: Props) {
  const { colors: COLORS } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithApple, signInWithGoogle } = useAuth();

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
          marginBottom: 0,
        },
        googleButtonText: { color: COLORS.primary, fontSize: 16, fontFamily: FONT.semibold },
        appleButton: { height: 56, marginTop: 12, borderRadius: 12, overflow: 'hidden' },
        loginLink: { marginTop: 24, alignItems: 'center' },
        loginLinkText: { color: COLORS.textMuted, fontSize: 14, fontFamily: FONT.regular },
        loginLinkBold: { color: COLORS.primary, fontFamily: FONT.bold },
      }),
    [COLORS]
  );

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      Alert.alert('Error', 'Could not sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithApple();
    } catch (error: unknown) {
      Alert.alert('Error', getApiErrorMessage(error, 'Could not sign in with Apple'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, name, password);
    } catch (error: unknown) {
      Alert.alert('Sign-up error', getApiErrorMessage(error, 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout contentContainerStyle={{ paddingTop: 60 }}>
      <SignUpHeader onBack={() => navigation.goBack()} />
      <View style={styles.form}>
        <FormTextField
          icon="person-outline"
          placeholder="Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
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
        <FormTextField
          icon="lock-closed-outline"
          placeholder="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <PrimaryButton title="Create account" loading={loading} onPress={handleSignUp} />
        <AuthDivider />
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignUp}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={20} color={COLORS.primary} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={styles.appleButton}
            onPress={handleAppleSignUp}
          />
        )}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>
            Already have an account? <Text style={styles.loginLinkBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreenLayout>
  );
}
