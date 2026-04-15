import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../constants/fonts';
import {
  COUNTRIES,
  DAILY_GOALS,
  THEME_OPTIONS,
} from '../constants/settingsOptions';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';
import type { UpdateUserRequest } from '../types';
import { ProfileCard } from '../components/settings/ProfileCard';
import { SettingsExpandableRow } from '../components/settings/SettingsExpandableRow';
import { SubscriptionModal } from '../components/subscription/SubscriptionModal';

export default function SettingsScreen() {
  const { preference, setPreference, colors: COLORS } = useTheme();
  const { user, signOut, updateUserData, refreshUser } = useAuth();
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: COLORS.background },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        },
        contentContainer: { padding: 16 },
        section: { marginBottom: 24 },
        sectionTitle: {
          fontSize: 18,
          color: COLORS.textPrimary,
          fontFamily: FONT.bold,
          marginBottom: 12,
        },
        picker: {
          backgroundColor: COLORS.surface,
          borderRadius: 12,
          marginBottom: 8,
          overflow: 'hidden',
        },
        pickerItem: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.lightGray,
        },
        pickerItemText: { fontSize: 16, color: COLORS.textPrimary, fontFamily: FONT.regular },
        personalityItem: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
        personalityText: { flex: 1 },
        personalityDescription: {
          fontSize: 12,
          color: COLORS.textMuted,
          fontFamily: FONT.regular,
          marginTop: 2,
        },
        settingItem: {
          backgroundColor: COLORS.surface,
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        },
        settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
        settingLabel: { fontSize: 16, color: COLORS.textPrimary, fontFamily: FONT.medium },
        settingDescription: {
          fontSize: 12,
          color: COLORS.textMuted,
          fontFamily: FONT.regular,
          marginTop: 2,
        },
        signOutButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.surface,
          borderRadius: 12,
          padding: 16,
          gap: 8,
          marginTop: 16,
        },
        signOutText: { fontSize: 16, color: COLORS.error, fontFamily: FONT.semibold },
        version: {
          textAlign: 'center',
          fontSize: 12,
          color: COLORS.textMuted,
          fontFamily: FONT.regular,
          marginTop: 24,
          marginBottom: 8,
        },
        coinsCard: {
          backgroundColor: COLORS.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 8,
        },
        coinsCardTop: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        },
        coinsCardLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        },
        coinsIconWrap: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: `${COLORS.warning}22`,
          justifyContent: 'center',
          alignItems: 'center',
        },
        coinsLabel: {
          fontSize: 16,
          fontFamily: FONT.semibold,
          color: COLORS.textPrimary,
        },
        coinsSubLabel: {
          fontSize: 12,
          fontFamily: FONT.regular,
          color: COLORS.textMuted,
          marginTop: 1,
        },
        coinsAmount: {
          fontSize: 20,
          fontFamily: FONT.bold,
          color: COLORS.primary,
        },
        coinsBar: {
          height: 6,
          borderRadius: 3,
          backgroundColor: COLORS.lightGray,
          overflow: 'hidden',
          marginBottom: 6,
        },
        coinsBarFill: {
          height: 6,
          borderRadius: 3,
          backgroundColor: COLORS.primary,
        },
        coinsBarLow: {
          backgroundColor: '#F59E0B',
        },
        coinsBarHint: {
          fontSize: 11,
          fontFamily: FONT.regular,
          color: COLORS.textMuted,
        },
        upgradeBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: COLORS.primary,
          borderRadius: 14,
          paddingVertical: 14,
          marginBottom: 8,
        },
        upgradeBtnText: {
          fontSize: 16,
          fontFamily: FONT.bold,
          color: COLORS.white,
        },
        subscriptionBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          backgroundColor: `${COLORS.primary}18`,
          borderRadius: 14,
          paddingVertical: 12,
          marginBottom: 8,
        },
        subscriptionBadgeText: {
          fontSize: 14,
          fontFamily: FONT.semibold,
          color: COLORS.primary,
        },
      }),
    [COLORS]
  );

  const updateSettings = async (data: UpdateUserRequest) => {
    if (!user) return;
    try {
      await apiService.updateUser(data);
      updateUserData(data);
      await refreshUser();
    } catch {
      Alert.alert('Error', 'Could not update settings');
    }
  };

  const selectedCountry = COUNTRIES.find((c) => c.code === user?.country);
  const selectedTheme = THEME_OPTIONS.find((t) => t.value === preference);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isPro = user.subscriptionType !== 'free';
  const maxCoins = user.subscriptionType === 'pro_plus' ? 10000
    : user.subscriptionType === 'pro' ? 5000
    : 200;
  const coinFraction = Math.min(user.karmaCoins / maxCoins, 1);
  const isLow = !isPro && user.karmaCoins <= 30;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ProfileCard name={user.name} email={user.email} />

      {/* KarmaCoins section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>KarmaCoins</Text>

        <View style={styles.coinsCard}>
          <View style={styles.coinsCardTop}>
            <View style={styles.coinsCardLeft}>
              <View style={styles.coinsIconWrap}>
                <Text style={{ fontSize: 20 }}>🪙</Text>
              </View>
              <View>
                <Text style={styles.coinsLabel}>
                  {isPro ? `${user.subscriptionType === 'pro_plus' ? 'Pro+' : 'Pro'} Plan` : 'Free Plan'}
                </Text>
                <Text style={styles.coinsSubLabel}>
                  {isPro ? 'Resets monthly' : '200 coins/day · resets daily'}
                </Text>
              </View>
            </View>
            <Text style={styles.coinsAmount}>{user.karmaCoins}</Text>
          </View>

          <View style={styles.coinsBar}>
            <View
              style={[
                styles.coinsBarFill,
                { width: `${coinFraction * 100}%` },
                isLow && styles.coinsBarLow,
              ]}
            />
          </View>
          <Text style={styles.coinsBarHint}>
            {user.karmaCoins} / {maxCoins} coins remaining · 10 coins per request
          </Text>
        </View>

        {isPro ? (
          <View style={styles.subscriptionBadge}>
            <Ionicons name="flash" size={16} color={COLORS.primary} />
            <Text style={styles.subscriptionBadgeText}>
              {user.subscriptionType === 'pro_plus' ? 'Pro+ Active' : 'Pro Active'}
              {user.subscriptionExpiry
                ? ` · renews ${new Date(user.subscriptionExpiry).toLocaleDateString()}`
                : ''}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => setSubscriptionModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="flash" size={18} color={COLORS.white} />
            <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <SettingsExpandableRow
          icon="moon-outline"
          label="Theme"
          description="System, light, or dark"
          valueLabel={selectedTheme?.label ?? ''}
          expanded={showThemePicker}
          onPress={() => setShowThemePicker(!showThemePicker)}
        />
        {showThemePicker && (
          <View style={styles.picker}>
            {THEME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.pickerItem}
                onPress={async () => {
                  await setPreference(opt.value);
                  setShowThemePicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{opt.label}</Text>
                {preference === opt.value && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <SettingsExpandableRow
          icon="globe-outline"
          label="Country"
          valueLabel={`${selectedCountry?.flag ?? ''} ${selectedCountry?.name ?? ''}`}
          expanded={showCountryPicker}
          onPress={() => setShowCountryPicker(!showCountryPicker)}
        />
        {showCountryPicker && (
          <View style={styles.picker}>
            {COUNTRIES.map((country) => (
              <TouchableOpacity
                key={country.code}
                style={styles.pickerItem}
                onPress={async () => {
                  await updateSettings({ country: country.code });
                  setShowCountryPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>
                  {country.flag} {country.name}
                </Text>
                {user.country === country.code && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bot settings</Text>
        <SettingsExpandableRow
          icon="trophy-outline"
          label="Daily goal"
          valueLabel={String(user.karmaDailyGoal)}
          expanded={showGoalPicker}
          onPress={() => setShowGoalPicker(!showGoalPicker)}
        />
        {showGoalPicker && (
          <View style={styles.picker}>
            {DAILY_GOALS.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={styles.pickerItem}
                onPress={async () => {
                  await updateSettings({ karmaDailyGoal: goal });
                  setShowGoalPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{goal} karma</Text>
                {user.karmaDailyGoal === goal && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
            <View>
              <Text style={styles.settingLabel}>Reminders</Text>
              <Text style={styles.settingDescription}>Daily notifications</Text>
            </View>
          </View>
          <Switch
            value={user.isNotificationReminder}
            onValueChange={(v) => updateSettings({ isNotificationReminder: v })}
            trackColor={{ false: COLORS.lightGray, true: COLORS.secondary }}
            thumbColor={user.isNotificationReminder ? COLORS.primary : COLORS.white}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>

      <SubscriptionModal
        visible={subscriptionModalVisible}
        onClose={() => setSubscriptionModalVisible(false)}
      />
    </ScrollView>
  );
}
