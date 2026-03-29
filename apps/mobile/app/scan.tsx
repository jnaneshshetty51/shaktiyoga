import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useScanAttendance } from '../src/hooks';
import { useAuthStore } from '../src/store/auth';

export default function ScanScreen() {
  const { user } = useAuthStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    name?: string;
  } | null>(null);
  const scanMutation = useScanAttendance();
  const cooldownRef = useRef(false);

  const isAuthorized = ['TEACHER', 'STAFF_ADMIN', 'SUPER_ADMIN'].includes(user?.role ?? '');

  if (!isAuthorized) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Access denied</Text>
        <Text style={styles.errorSubtext}>Only teachers and admins can scan attendance.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Camera permission required</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function handleBarcodeScan({ data }: { data: string }) {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setScanned(true);

    try {
      const result = await scanMutation.mutateAsync(data);
      setLastResult({ success: true, message: 'Attendance marked!', name: result?.user?.name });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      setLastResult({ success: false, message: e.message ?? 'Invalid QR code' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setTimeout(() => {
      cooldownRef.current = false;
      setScanned(false);
      setLastResult(null);
    }, 2500);
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScan}
      />

      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.hint}>Point at student's QR code</Text>
      </View>

      {lastResult && (
        <View
          style={[
            styles.resultBanner,
            lastResult.success ? styles.successBanner : styles.errorBanner,
          ]}
        >
          <Text style={styles.resultIcon}>{lastResult.success ? '✓' : '✗'}</Text>
          <View>
            {lastResult.name ? (
              <Text style={styles.resultName}>{lastResult.name}</Text>
            ) : null}
            <Text style={styles.resultMsg}>{lastResult.message}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    gap: 12, padding: 24, backgroundColor: '#FAFAF8',
  },
  loadingText: { fontSize: 16, color: '#6B7280' },
  errorText: { fontSize: 20, fontWeight: '700', color: '#111827' },
  errorSubtext: { fontSize: 15, color: '#6B7280', textAlign: 'center' },
  backLink: { fontSize: 15, color: '#4A6741', fontWeight: '500', marginTop: 8 },
  permBtn: {
    backgroundColor: '#4A6741', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 14, marginTop: 8,
  },
  permBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanFrame: {
    width: 240, height: 240, borderWidth: 3,
    borderColor: '#4A6741', borderRadius: 16, backgroundColor: 'transparent',
  },
  hint: {
    color: '#fff', marginTop: 20, fontSize: 15, fontWeight: '500',
    textShadowColor: '#000', textShadowRadius: 4,
  },
  resultBanner: {
    position: 'absolute', bottom: 60, left: 20, right: 20,
    borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  successBanner: { backgroundColor: '#065F46' },
  errorBanner: { backgroundColor: '#991B1B' },
  resultIcon: { fontSize: 28, color: '#fff', fontWeight: '700' },
  resultName: { fontSize: 16, color: '#fff', fontWeight: '700' },
  resultMsg: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
});
