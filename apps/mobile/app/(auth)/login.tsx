import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function LoginScreen() {
  const [tab, setTab] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();

  async function handleSendOtp() {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      Alert.alert('Invalid phone', 'Please enter a valid 10-digit phone number.');
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/api/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ phone: `+91${digits.slice(-10)}` }),
        skipAuth: true,
      });
      router.push({ pathname: '/(auth)/otp', params: { phone: `+91${digits.slice(-10)}` } });
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailLogin() {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<any>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      });
      await setAuth(data.user, data.accessToken, data.refreshToken);
    } catch (e: any) {
      Alert.alert('Login failed', e.message ?? 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>🌿 YogaStudio</Text>
        <Text style={styles.subtitle}>Your wellness journey starts here</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'phone' && styles.activeTab]}
          onPress={() => setTab('phone')}
        >
          <Text style={[styles.tabText, tab === 'phone' && styles.activeTabText]}>Phone</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'email' && styles.activeTab]}
          onPress={() => setTab('email')}
        >
          <Text style={[styles.tabText, tab === 'email' && styles.activeTabText]}>Email</Text>
        </TouchableOpacity>
      </View>

      {tab === 'phone' ? (
        <View style={styles.form}>
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Send OTP</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleEmailLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Sign In</Text>}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', justifyContent: 'center', paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 32, fontWeight: '700', color: '#4A6741', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280' },
  tabBar: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  activeTabText: { color: '#4A6741', fontWeight: '600' },
  form: { gap: 12 },
  phoneRow: { flexDirection: 'row', gap: 8 },
  countryCode: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, justifyContent: 'center' },
  countryCodeText: { fontSize: 15, color: '#111827' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111827' },
  phoneInput: { flex: 1 },
  primaryBtn: { backgroundColor: '#4A6741', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
