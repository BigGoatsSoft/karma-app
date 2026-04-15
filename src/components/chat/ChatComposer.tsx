import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../../constants/fonts';
import { useTheme } from '../../contexts/ThemeContext';
import { PERSONALITIES } from '../../constants/settingsOptions';
import type { User } from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  loading: boolean;
  onNewChat: () => void;
  personality: User['botPersonality'];
  onPersonalityChange: (p: User['botPersonality']) => void;
  karmaCoins?: number;
  subscriptionType?: string;
  onUpgradePress: () => void;
}

export function ChatComposer({
  value,
  onChangeText,
  onSend,
  loading,
  onNewChat,
  personality,
  onPersonalityChange,
  karmaCoins = 0,
  subscriptionType = 'free',
  onUpgradePress,
}: Props) {
  const { colors: COLORS } = useTheme();
  const [personaOpen, setPersonaOpen] = useState(false);

  const currentPersona = PERSONALITIES.find((p) => p.value === personality) ?? PERSONALITIES[0];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.lightGray,
          paddingHorizontal: 12,
          paddingTop: 10,
          paddingBottom: 12,
          gap: 8,
        },
        inputRow: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 8,
        },
        newChatBtn: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: COLORS.background,
          borderWidth: 1,
          borderColor: COLORS.lightGray,
          justifyContent: 'center',
          alignItems: 'center',
        },
        input: {
          flex: 1,
          backgroundColor: COLORS.background,
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 10,
          fontSize: 15,
          fontFamily: FONT.regular,
          color: COLORS.textPrimary,
          maxHeight: 100,
        },
        sendButton: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: COLORS.primary,
          justifyContent: 'center',
          alignItems: 'center',
        },
        sendButtonDisabled: { opacity: 0.5 },
        personaRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 4,
          gap: 8,
        },
        coinsBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: COLORS.background,
          borderRadius: 14,
          paddingHorizontal: 9,
          paddingVertical: 5,
          borderWidth: 1,
          borderColor: COLORS.lightGray,
        },
        coinsBadgeText: {
          fontSize: 13,
          fontFamily: FONT.semibold,
          color: COLORS.textMuted,
        },
        coinsLow: {
          borderColor: '#F59E0B44',
          backgroundColor: '#F59E0B0d',
        },
        coinsLowText: {
          color: '#F59E0B',
        },
        upgradePill: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: COLORS.primary,
          borderRadius: 14,
          paddingHorizontal: 10,
          paddingVertical: 5,
        },
        upgradePillText: {
          fontSize: 12,
          fontFamily: FONT.bold,
          color: COLORS.white,
        },
        personaPill: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          backgroundColor: COLORS.background,
          borderRadius: 14,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderWidth: 1,
          borderColor: COLORS.lightGray,
        },
        personaPillText: {
          fontSize: 13,
          fontFamily: FONT.semibold,
          color: COLORS.textMuted,
        },
        // Persona picker modal
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'flex-end',
        },
        sheet: {
          backgroundColor: COLORS.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingBottom: 32,
          maxHeight: SCREEN_HEIGHT * 0.5,
        },
        sheetHandle: {
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: COLORS.lightGray,
          alignSelf: 'center',
          marginTop: 12,
          marginBottom: 4,
        },
        sheetHeader: {
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.lightGray,
        },
        sheetTitle: {
          fontSize: 17,
          fontFamily: FONT.bold,
          color: COLORS.textPrimary,
        },
        personaItem: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.lightGray,
        },
        personaItemLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          flex: 1,
        },
        personaIconWrap: {
          width: 38,
          height: 38,
          borderRadius: 19,
          justifyContent: 'center',
          alignItems: 'center',
        },
        personaLabel: {
          fontSize: 16,
          fontFamily: FONT.semibold,
          color: COLORS.textPrimary,
        },
        personaDesc: {
          fontSize: 12,
          fontFamily: FONT.regular,
          color: COLORS.textMuted,
          marginTop: 2,
        },
      }),
    [COLORS]
  );

  const canSend = value.trim().length > 0 && !loading;

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputRow}>
        {/* New chat button */}
        <TouchableOpacity style={styles.newChatBtn} onPress={onNewChat} activeOpacity={0.7}>
          <Ionicons name="create-outline" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Describe what you did..."
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={onSend}
          disabled={!canSend}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons name="send" size={20} color={COLORS.white} />
          )}
        </TouchableOpacity>
      </View>

      {/* Persona selector + coins + upgrade row */}
      <View style={styles.personaRow}>
        <TouchableOpacity
          style={styles.personaPill}
          onPress={() => setPersonaOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name={currentPersona.icon} size={13} color={COLORS.textMuted} />
          <Text style={styles.personaPillText}>{currentPersona.label}</Text>
          <Ionicons name="chevron-down" size={12} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Coins badge */}
        <TouchableOpacity
          style={[styles.coinsBadge, karmaCoins <= 30 && styles.coinsLow]}
          onPress={onUpgradePress}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 12 }}>🪙</Text>
          <Text style={[styles.coinsBadgeText, karmaCoins <= 30 && styles.coinsLowText]}>
            {karmaCoins}
          </Text>
        </TouchableOpacity>

        {/* Upgrade to Pro pill — hidden if already subscribed */}
        {subscriptionType === 'free' && (
          <TouchableOpacity
            style={styles.upgradePill}
            onPress={onUpgradePress}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={12} color={COLORS.white} />
            <Text style={styles.upgradePillText}>Upgrade to Pro</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Persona picker sheet */}
      <Modal
        visible={personaOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPersonaOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setPersonaOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Bot Personality</Text>
            </View>
            {PERSONALITIES.map((p) => {
              const isSelected = p.value === personality;
              return (
                <TouchableOpacity
                  key={p.value}
                  style={styles.personaItem}
                  onPress={() => {
                    onPersonalityChange(p.value);
                    setPersonaOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.personaItemLeft}>
                    <View
                      style={[
                        styles.personaIconWrap,
                        { backgroundColor: isSelected ? `${COLORS.primary}1a` : COLORS.surface },
                      ]}
                    >
                      <Ionicons
                        name={p.icon}
                        size={20}
                        color={isSelected ? COLORS.primary : COLORS.textMuted}
                      />
                    </View>
                    <View>
                      <Text style={styles.personaLabel}>{p.label}</Text>
                      <Text style={styles.personaDesc}>{p.description}</Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
