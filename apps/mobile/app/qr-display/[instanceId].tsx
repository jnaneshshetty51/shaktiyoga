import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQrCode } from '../../src/hooks';

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function QrDisplayScreen() {
  const { instanceId } = useLocalSearchParams<{ instanceId: string }>();
  const { data, isLoading, isError, refetch } = useQrCode(instanceId);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A6741" />
        <Text style={styles.loadingText}>Generating QR code…</Text>
      </View>
    );
  }

  if (isError || !data?.qrDataUrl) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Could not generate QR code</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {data.className ? (
        <Text style={styles.className}>{data.className}</Text>
      ) : null}
      {data.classDate ? (
        <Text style={styles.classDate}>
          {new Date(data.classDate).toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long',
          })}
        </Text>
      ) : null}

      <View style={styles.qrContainer}>
        <Image
          source={{ uri: data.qrDataUrl }}
          style={styles.qrImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.expiryText}>Show this to students to mark attendance</Text>
      {data.expiresAt ? (
        <Text style={styles.expiryTime}>Valid until {formatTime(data.expiresAt)}</Text>
      ) : null}

      <TouchableOpacity style={styles.refreshBtn} onPress={() => refetch()}>
        <Text style={styles.refreshBtnText}>↻ Refresh QR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#FAFAF8',
    alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  className: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center' },
  classDate: { fontSize: 15, color: '#6B7280', textAlign: 'center' },
  qrContainer: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, marginVertical: 16,
  },
  qrImage: { width: 260, height: 260 },
  expiryText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  expiryTime: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 15 },
  errorText: { fontSize: 17, color: '#DC2626', fontWeight: '600' },
  retryBtn: {
    backgroundColor: '#4A6741', borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 8,
  },
  retryBtnText: { color: '#fff', fontWeight: '600' },
  refreshBtn: {
    backgroundColor: '#F3F4F6', borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 4,
  },
  refreshBtnText: { color: '#4A6741', fontWeight: '600', fontSize: 15 },
});
