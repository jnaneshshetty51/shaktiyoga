import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useMemberships, useMyPayments } from '../../src/hooks';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatAmount(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    CAPTURED: { bg: '#D1FAE5', fg: '#065F46' },
    PENDING:  { bg: '#FEF3C7', fg: '#92400E' },
    FAILED:   { bg: '#FEE2E2', fg: '#991B1B' },
    REFUNDED: { bg: '#E0E7FF', fg: '#3730A3' },
  };
  const s = map[status] ?? { bg: '#F3F4F6', fg: '#6B7280' };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.fg }]}>{status}</Text>
    </View>
  );
}

export default function MembershipScreen() {
  const { data: membershipsData, isLoading: membershipsLoading } = useMemberships();
  const { data: paymentsData, isLoading: paymentsLoading } = useMyPayments();

  const plans = membershipsData?.memberships ?? [];
  const payments = paymentsData?.payments ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.activeCard}>
        <Text style={styles.activeLabel}>CURRENT PLAN</Text>
        <Text style={styles.planName}>Unlimited Monthly</Text>
        <Text style={styles.planMeta}>Active through Dec 31, 2025</Text>
        <View style={styles.sessionRow}>
          <Text style={styles.sessionText}>Classes this week: 3</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Available Plans</Text>
      {membershipsLoading ? (
        <ActivityIndicator color="#4A6741" />
      ) : (
        plans.map((plan: any) => (
          <TouchableOpacity
            key={plan.id}
            style={styles.planCard}
            onPress={() =>
              router.push({ pathname: '/checkout', params: { membershipId: plan.id } })
            }
          >
            <View style={styles.planCardLeft}>
              <Text style={styles.planCardName}>{plan.name}</Text>
              <Text style={styles.planCardDesc}>{plan.description ?? `${plan.durationDays} days`}</Text>
              {plan.features?.length ? (
                <Text style={styles.planFeatures}>{plan.features.slice(0, 2).join(' · ')}</Text>
              ) : null}
            </View>
            <View style={styles.planCardRight}>
              <Text style={styles.planPrice}>{formatAmount(plan.price)}</Text>
              <View style={styles.selectBtn}>
                <Text style={styles.selectBtnText}>Select</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.sectionTitle}>Payment History</Text>
      {paymentsLoading ? (
        <ActivityIndicator color="#4A6741" />
      ) : payments.length === 0 ? (
        <Text style={styles.emptyText}>No payments yet</Text>
      ) : (
        payments.slice(0, 5).map((p: any) => (
          <View key={p.id} style={styles.paymentRow}>
            <View>
              <Text style={styles.paymentName}>{p.membership?.name ?? 'Membership'}</Text>
              <Text style={styles.paymentDate}>{formatDate(p.createdAt)}</Text>
              {p.invoiceNumber ? (
                <Text style={styles.invoiceNo}>#{p.invoiceNumber}</Text>
              ) : null}
            </View>
            <View style={styles.paymentRight}>
              <Text style={styles.paymentAmount}>{formatAmount(p.amount, p.currency)}</Text>
              <StatusBadge status={p.status} />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  content: { padding: 20, gap: 16 },
  activeCard: { backgroundColor: '#4A6741', borderRadius: 20, padding: 22, gap: 6 },
  activeLabel: { fontSize: 11, color: '#A7C4A0', fontWeight: '700', letterSpacing: 1 },
  planName: { fontSize: 24, fontWeight: '700', color: '#fff' },
  planMeta: { fontSize: 14, color: '#D1FAE5' },
  sessionRow: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  sessionText: { fontSize: 14, color: '#fff', fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  planCardLeft: { flex: 1, gap: 4 },
  planCardName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  planCardDesc: { fontSize: 13, color: '#6B7280' },
  planFeatures: { fontSize: 12, color: '#9CA3AF' },
  planCardRight: { alignItems: 'flex-end', gap: 8 },
  planPrice: { fontSize: 18, fontWeight: '700', color: '#4A6741' },
  selectBtn: { backgroundColor: '#4A6741', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  selectBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  emptyText: { color: '#9CA3AF', textAlign: 'center', paddingVertical: 16 },
  paymentRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  paymentDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  invoiceNo: { fontSize: 11, color: '#9CA3AF' },
  paymentRight: { alignItems: 'flex-end', gap: 4 },
  paymentAmount: { fontSize: 15, fontWeight: '700', color: '#111827' },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
