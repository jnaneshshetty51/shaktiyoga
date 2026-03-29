import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const refs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];
  const { setAuth } = useAuthStore();

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  function handleChange(value: string, index: number) {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 5) refs[index + 1].current?.focus();
    if (value && index === 5) {
      const code = next.join('');
      if (code.length === 6) verifyOtp(code);
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  }

  async function verifyOtp(code: string) {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/api/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
        skipAuth: true,
      });
      await setAuth(data.user, data.accessToken, data.refreshToken);
    } catch (e: any) {
      Alert.alert('Invalid OTP', e.message ?? 'Please try again.');
      setDigits(['', '', '', '', '', '']);
      refs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await apiFetch('/api/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ phone }),
        skipAuth: true,
      });
      setResendTimer(30);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not resend OTP.');
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>Sent to {phone}</Text>

      <View style={styles.otpRow}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={refs[i]}
            style={[styles.otpBox, d ? styles.otpBoxFilled : null]}
            value={d}
            onChangeText={(v) => handleChange(v, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {loading && <ActivityIndicator color="#4A6741" style={{ marginTop: 20 }} />}

      <TouchableOpacity
        style={styles.resendBtn}
        onPress={handleResend}
        disabled={resendTimer > 0}
      >
        <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8', paddingHorizontal: 24, paddingTop: 60 },
  back: { marginBottom: 32 },
  backText: { fontSize: 16, color: '#4A6741', fontWeight: '500' },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 40 },
  otpRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  otpBox: { width: 48, height: 56, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, textAlign: 'center', fontSize: 22, fontWeight: '700', color: '#111827', backgroundColor: '#fff' },
  otpBoxFilled: { borderColor: '#4A6741' },
  resendBtn: { marginTop: 32, alignItems: 'center' },
  resendText: { fontSize: 15, color: '#4A6741', fontWeight: '500' },
  resendDisabled: { color: '#9CA3AF' },
});
