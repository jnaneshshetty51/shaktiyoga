import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentSuccessScreen() {
  const { paymentId } = useLocalSearchParams<{ paymentId: string }>();
  const qc = useQueryClient();

  useEffect(() => {
    qc.invalidateQueries({ queryKey: ['memberships'] });
    qc.invalidateQueries({ queryKey: ['payments'] });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>✓</Text>
      </View>
      <Text style={styles.title}>Payment Successful!</Text>
      <Text style={styles.subtitle}>Your membership has been activated.</Text>
      {paymentId ? (
        <Text style={styles.paymentRef}>Ref: {paymentId.slice(0, 16)}…</Text>
      ) : null}
      <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.homeBtnText}>Go to Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.membershipBtn}
        onPress={() => router.replace('/(tabs)/membership')}
      >
        <Text style={styles.membershipBtnText}>View Membership</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#FAFAF8',
    justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16,
  },
  iconCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#4A6741', justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  icon: { fontSize: 40, color: '#fff', fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  paymentRef: { fontSize: 13, color: '#9CA3AF' },
  homeBtn: {
    backgroundColor: '#4A6741', borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 40, marginTop: 16,
  },
  homeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  membershipBtn: { paddingVertical: 12 },
  membershipBtnText: { color: '#4A6741', fontSize: 15, fontWeight: '500' },
});
