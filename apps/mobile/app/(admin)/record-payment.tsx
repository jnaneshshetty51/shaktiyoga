import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { apiFetch } from '../../src/lib/api';

export default function RecordPaymentScreen() {
  const [identifier, setIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRecord() {
    if (!identifier || !amount) {
      Alert.alert('Missing fields', 'Please enter member phone/email and amount.');
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/api/admin/payments/manual', {
        method: 'POST',
        body: JSON.stringify({ identifier, amount: parseFloat(amount), note }),
      });
      Alert.alert('Recorded', 'Payment has been recorded successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not record payment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Member (phone or email)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. +91 9999999999"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Amount (₹)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 2500"
        value={amount}
        onChangeText={setAmount}
        keyboardType="number-pad"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="e.g. Cash payment for monthly plan"
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
        placeholderTextColor="#9CA3AF"
      />

      <TouchableOpacity style={styles.btn} onPress={handleRecord} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Record Payment</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  content: { padding: 20, gap: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111827',
  },
  textArea: { height: 90, textAlignVertical: 'top', paddingTop: 14 },
  btn: { backgroundColor: '#4A6741', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
