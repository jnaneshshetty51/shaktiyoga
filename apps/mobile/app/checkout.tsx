import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import RazorpayCheckout from 'react-native-razorpay';
import Constants from 'expo-constants';
import { apiFetch } from '../src/lib/api';
import { useAuthStore } from '../src/store/auth';

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount);
}

export default function CheckoutScreen() {
  const { membershipId } = useLocalSearchParams<{ membershipId: string }>();
  const { user } = useAuthStore();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    apiFetch<any>('/api/memberships')
      .then((d) => setPlan(d.memberships?.find((m: any) => m.id === membershipId)))
      .catch(() => Alert.alert('Error', 'Could not load plan details.'))
      .finally(() => setLoading(false));
  }, [membershipId]);

  async function handlePay() {
    if (!plan) return;
    setPaying(true);
    try {
      const orderData = await apiFetch<any>('/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ membershipId }),
      });

      const options = {
        key: orderData.keyId ?? (Constants.expoConfig?.extra as any)?.razorpayKeyId,
        order_id: orderData.orderId,
        amount: String(Math.round(plan.price * 100)),
        currency: plan.currency ?? 'INR',
        name: 'YogaStudio',
        description: plan.name,
        prefill: {
          name: user?.name ?? '',
          email: user?.email ?? '',
          contact: user?.phone ?? '',
        },
        theme: { color: '#4A6741' },
      };

      const paymentData = await (RazorpayCheckout as any).open(options);

      await apiFetch('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          membershipId,
        }),
      });

      router.replace({
        pathname: '/payment-success',
        params: { paymentId: orderData.paymentId },
      });
    } catch (e: any) {
      if (e?.code !== 'PAYMENT_CANCELLED') {
        Alert.alert('Payment failed', e.message ?? 'Please try again.');
      }
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <ActivityIndicator color="#4A6741" style={{ flex: 1, marginTop: 60 }} />;
  }

  if (!plan) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Plan not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.planSummary}>
        <Text style={styles.planLabel}>PLAN</Text>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planMeta}>
          {plan.durationDays} days
          {plan.classesPerWeek
            ? ` • ${plan.classesPerWeek} classes/week`
            : ' • Unlimited classes'}
        </Text>
        {plan.features?.length ? (
          <View style={styles.featureList}>
            {plan.features.map((f: string, i: number) => (
              <Text key={i} style={styles.feature}>✓ {f}</Text>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.priceSummary}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>{formatAmount(plan.price)}</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatAmount(plan.price)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.payBtn} onPress={handlePay} disabled={paying}>
        {paying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payBtnText}>Pay {formatAmount(plan.price)}</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.secureNote}>🔒 Secured by Razorpay</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  content: { padding: 20, gap: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#DC2626' },
  planSummary: { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  planLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '700', letterSpacing: 1 },
  planName: { fontSize: 22, fontWeight: '700', color: '#111827' },
  planMeta: { fontSize: 14, color: '#6B7280' },
  featureList: { marginTop: 8, gap: 4 },
  feature: { fontSize: 14, color: '#4A6741', fontWeight: '500' },
  priceSummary: { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { fontSize: 15, color: '#6B7280' },
  priceValue: { fontSize: 15, color: '#111827' },
  totalRow: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  totalLabel: { fontSize: 17, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 17, fontWeight: '700', color: '#4A6741' },
  payBtn: { backgroundColor: '#4A6741', borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  payBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  secureNote: { textAlign: 'center', color: '#9CA3AF', fontSize: 13 },
});
