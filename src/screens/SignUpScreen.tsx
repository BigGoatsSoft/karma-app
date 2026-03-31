import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
  const { signUp } = useAuth();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        form: { width: '100%' },
        loginLink: { marginTop: 24, alignItems: 'center' },
        loginLinkText: { color: COLORS.textMuted, fontSize: 14, fontFamily: FONT.regular },
        loginLinkBold: { color: COLORS.primary, fontFamily: FONT.bold },
      }),
    [COLORS]
  );

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
