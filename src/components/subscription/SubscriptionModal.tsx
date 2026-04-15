import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  type PurchaseCommon,
} from 'react-native-iap';
import { FONT } from '../../constants/fonts';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const SKU_PRO = 'karma_pro_monthly';
const SKU_PRO_PLUS = 'karma_pro_plus_monthly';

interface Plan {
  key: 'pro' | 'pro_plus';
  sku: string;
  title: string;
  price: string;
  coins: number;
  perDay: number;
  color: string;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    key: 'pro',
    sku: SKU_PRO,
    title: 'Pro',
    price: '$2.99',
    coins: 5000,
    perDay: Math.round(5000 / 30),
    color: '#2D6A4F',
  },
  {
    key: 'pro_plus',
    sku: SKU_PRO_PLUS,
    title: 'Pro+',
    price: '$4.99',
    coins: 10000,
    perDay: Math.round(10000 / 30),
    color: '#1B4332',
    badge: 'Best value',
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  outOfCoins?: boolean;
}

export function SubscriptionModal({ visible, onClose, outOfCoins = false }: Props) {
  const { colors: COLORS } = useTheme();
  const { refreshUser } = useAuth();
  const [iapReady, setIapReady] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    let purchaseListener: ReturnType<typeof purchaseUpdatedListener> | null = null;
    let errorListener: ReturnType<typeof purchaseErrorListener> | null = null;

    const setup = async () => {
      try {
        await initConnection();
        setIapReady(true);

        purchaseListener = purchaseUpdatedListener(async (purchase: PurchaseCommon) => {
          const purchaseToken = purchase.purchaseToken ?? undefined;

          if (purchaseToken) {
            try {
              const subscriptionType = purchase.productId === SKU_PRO ? 'pro' : 'pro_plus';
              await apiService.activateSubscription(subscriptionType, undefined, purchaseToken);
              await finishTransaction({
                purchase: purchase as Parameters<typeof finishTransaction>[0]['purchase'],
                isConsumable: false,
              });
              await refreshUser();
              setPurchasing(null);
              onClose();
              Alert.alert('Success!', 'Your subscription is now active. Enjoy your KarmaCoins! 🎉');
            } catch {
              setPurchasing(null);
              Alert.alert('Error', 'Purchase completed but activation failed. Please contact support.');
            }
          }
        });

        errorListener = purchaseErrorListener((error) => {
          setPurchasing(null);
          const code = (error as unknown as { code?: string }).code;
          if (code !== 'E_USER_CANCELLED') {
            Alert.alert('Purchase failed', error.message ?? 'Something went wrong. Please try again.');
          }
        });
      } catch {
        setIapReady(false);
      }
    };

    setup();

    return () => {
      purchaseListener?.remove();
      errorListener?.remove();
      endConnection();
      setIapReady(false);
    };
  }, [visible, onClose, refreshUser]);

  const handleSubscribe = useCallback(async (plan: Plan) => {
    if (!iapReady) {
      Alert.alert('Not available', 'In-app purchases are not available on this device.');
      return;
    }
    try {
      setPurchasing(plan.key);
      const products = await fetchProducts({ skus: [plan.sku], type: 'subs' });
      if (!products || products.length === 0) {
        setPurchasing(null);
        Alert.alert('Not available', 'This subscription is not available in your region.');
        return;
      }
      await requestPurchase({
        type: 'subs',
        request: {
          apple: { sku: plan.sku },
          google: { skus: [plan.sku] },
        },
      });
    } catch {
      setPurchasing(null);
    }
  }, [iapReady]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'flex-end',
        },
        sheet: {
          backgroundColor: COLORS.background,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingBottom: 40,
          maxHeight: '90%',
        },
        handle: {
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: COLORS.lightGray,
          alignSelf: 'center',
          marginTop: 12,
          marginBottom: 8,
        },
        closeBtn: {
          position: 'absolute',
          top: 20,
          right: 20,
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: COLORS.surface,
          justifyContent: 'center',
          alignItems: 'center',
        },
        header: {
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: 20,
        },
        coinIcon: {
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#F59E0B22',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 14,
        },
        outOfCoinsTag: {
          backgroundColor: `${COLORS.error}18`,
          borderRadius: 20,
          paddingHorizontal: 14,
          paddingVertical: 5,
          marginBottom: 12,
        },
        outOfCoinsTagText: {
          fontSize: 13,
          fontFamily: FONT.semibold,
          color: COLORS.error,
        },
        title: {
          fontSize: 22,
          fontFamily: FONT.bold,
          color: COLORS.textPrimary,
          textAlign: 'center',
          marginBottom: 6,
        },
        subtitle: {
          fontSize: 14,
          fontFamily: FONT.regular,
          color: COLORS.textMuted,
          textAlign: 'center',
          lineHeight: 20,
        },
        freeRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: 10,
          backgroundColor: COLORS.surface,
          marginHorizontal: 24,
          borderRadius: 12,
          paddingVertical: 10,
        },
        freeText: {
          fontSize: 13,
          fontFamily: FONT.medium,
          color: COLORS.textMuted,
        },
        plansContainer: {
          paddingHorizontal: 16,
          paddingTop: 4,
          gap: 12,
        },
        planCard: {
          borderRadius: 18,
          padding: 20,
          borderWidth: 2,
        },
        planCardInner: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        },
        planBadge: {
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingVertical: 3,
          alignSelf: 'flex-start',
          marginBottom: 4,
        },
        planBadgeText: {
          fontSize: 11,
          fontFamily: FONT.bold,
          color: COLORS.white,
          letterSpacing: 0.5,
        },
        planTitle: {
          fontSize: 22,
          fontFamily: FONT.bold,
        },
        planPrice: {
          fontSize: 16,
          fontFamily: FONT.semibold,
          color: COLORS.textMuted,
        },
        planCoinsRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginBottom: 6,
        },
        planCoinsText: {
          fontSize: 15,
          fontFamily: FONT.semibold,
          color: COLORS.textPrimary,
        },
        planPerDayText: {
          fontSize: 12,
          fontFamily: FONT.regular,
          color: COLORS.textMuted,
        },
        planBtn: {
          marginTop: 14,
          borderRadius: 14,
          paddingVertical: 13,
          alignItems: 'center',
        },
        planBtnText: {
          fontSize: 16,
          fontFamily: FONT.bold,
          color: COLORS.white,
        },
        features: {
          gap: 4,
          marginTop: 2,
        },
        featureRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        featureText: {
          fontSize: 13,
          fontFamily: FONT.regular,
          color: COLORS.textSecondary,
        },
        disclaimer: {
          fontSize: 11,
          fontFamily: FONT.regular,
          color: COLORS.textMuted,
          textAlign: 'center',
          paddingHorizontal: 24,
          marginTop: 16,
          lineHeight: 16,
        },
      }),
    [COLORS]
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <View style={styles.handle} />

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.coinIcon}>
                <Text style={{ fontSize: 32 }}>🪙</Text>
              </View>
              {outOfCoins && (
                <View style={styles.outOfCoinsTag}>
                  <Text style={styles.outOfCoinsTagText}>You've run out of KarmaCoins</Text>
                </View>
              )}
              <Text style={styles.title}>
                {outOfCoins ? 'Get more coins' : 'Upgrade to Pro'}
              </Text>
              <Text style={styles.subtitle}>
                Unlock more coins to keep analyzing your karma with the AI assistant.
              </Text>
            </View>

            <View style={styles.freeRow}>
              <Ionicons name="sunny-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.freeText}>Free: 200 coins/day · 10 coins per request</Text>
            </View>

            <View style={styles.plansContainer}>
              {PLANS.map((plan) => {
                const isLoading = purchasing === plan.key;
                const cardColor = plan.key === 'pro' ? COLORS.primary : COLORS.tertiary;
                return (
                  <View
                    key={plan.key}
                    style={[
                      styles.planCard,
                      { backgroundColor: `${cardColor}0d`, borderColor: `${cardColor}33` },
                    ]}
                  >
                    {plan.badge && (
                      <View style={[styles.planBadge, { backgroundColor: cardColor }]}>
                        <Text style={styles.planBadgeText}>{plan.badge.toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={styles.planCardInner}>
                      <Text style={[styles.planTitle, { color: cardColor }]}>{plan.title}</Text>
                      <Text style={styles.planPrice}>{plan.price}/mo</Text>
                    </View>

                    <View style={styles.features}>
                      <View style={styles.planCoinsRow}>
                        <Text style={{ fontSize: 16 }}>🪙</Text>
                        <Text style={styles.planCoinsText}>
                          {plan.coins.toLocaleString()} coins / month
                        </Text>
                      </View>
                      <Text style={styles.planPerDayText}>
                        ≈ {plan.perDay} coins per day · {Math.floor(plan.coins / 10)} requests/month
                      </Text>

                      <View style={{ height: 10 }} />

                      {['All free features included', 'Priority AI responses', 'Coins refresh monthly'].map((f) => (
                        <View key={f} style={styles.featureRow}>
                          <Ionicons name="checkmark-circle" size={15} color={cardColor} />
                          <Text style={styles.featureText}>{f}</Text>
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={[styles.planBtn, { backgroundColor: cardColor }]}
                      onPress={() => handleSubscribe(plan)}
                      disabled={!!purchasing}
                      activeOpacity={0.85}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <Text style={styles.planBtnText}>Subscribe · {plan.price}/mo</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            <Text style={styles.disclaimer}>
              Subscriptions auto-renew monthly. Cancel any time in your{' '}
              {Platform.OS === 'ios' ? 'App Store' : 'Google Play'} account settings.
              Payment will be charged to your account at purchase confirmation.
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
