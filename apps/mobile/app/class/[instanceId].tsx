import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView, Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useClassDetail, useBookClass, useJoinWaitlist, useCancelBooking } from '../../src/hooks';
import { useAuthStore } from '../../src/store/auth';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function ClassDetailScreen() {
  const { instanceId } = useLocalSearchParams<{ instanceId: string }>();
  const { user } = useAuthStore();
  const { data, isLoading } = useClassDetail(instanceId);
  const bookMutation = useBookClass();
  const waitlistMutation = useJoinWaitlist();
  const cancelMutation = useCancelBooking();

  const isTeacher = ['TEACHER', 'STAFF_ADMIN', 'SUPER_ADMIN'].includes(user?.role ?? '');
  const cls = data?.instance;

  async function handleBook() {
    try {
      if (cls?.isFull) {
        await waitlistMutation.mutateAsync(instanceId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Waitlisted', 'You have been added to the waitlist.');
      } else {
        await bookMutation.mutateAsync(instanceId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Booked!', 'Your class has been confirmed.');
      }
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', e.message ?? 'Could not complete booking.');
    }
  }

  async function handleCancel(bookingId: string) {
    Alert.alert('Cancel class?', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelMutation.mutateAsync(bookingId);
            router.back();
          } catch (e: any) {
            Alert.alert('Error', e.message ?? 'Could not cancel.');
          }
        },
      },
    ]);
  }

  if (isLoading) {
    return <ActivityIndicator color="#4A6741" style={{ flex: 1, marginTop: 60 }} />;
  }

  if (!cls) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Class not found</Text>
      </View>
    );
  }

  const remaining = cls.capacity - (cls.bookedCount ?? 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.className}>{cls.batch?.name ?? 'Yoga Class'}</Text>
      <Text style={styles.dateText}>{formatDate(cls.date)}</Text>
      <Text style={styles.timeText}>
        {formatTime(cls.date)}
        {cls.batch?.durationMins ? ` · ${cls.batch.durationMins} min` : ''}
      </Text>

      <View style={styles.infoGrid}>
        <View style={styles.infoChip}>
          <Text style={styles.infoChipLabel}>SPOTS</Text>
          <Text style={styles.infoChipValue}>
            {remaining > 0 ? `${remaining}/${cls.capacity}` : 'Full'}
          </Text>
        </View>
        {cls.batch?.planType ? (
          <View style={styles.infoChip}>
            <Text style={styles.infoChipLabel}>PLAN</Text>
            <Text style={styles.infoChipValue}>{cls.batch.planType}</Text>
          </View>
        ) : null}
      </View>

      {cls.batch?.description ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{cls.batch.description}</Text>
        </View>
      ) : null}

      {cls.isUserBooked && cls.meetingLink ? (
        <TouchableOpacity
          style={styles.joinBtn}
          onPress={() => Linking.openURL(cls.meetingLink)}
        >
          <Text style={styles.joinBtnText}>🔗 Join Online Class</Text>
        </TouchableOpacity>
      ) : null}

      {isTeacher ? (
        <View style={styles.teacherActions}>
          <TouchableOpacity
            style={styles.rosterBtn}
            onPress={() =>
              router.push({ pathname: '/roster/[instanceId]', params: { instanceId } })
            }
          >
            <Text style={styles.rosterBtnText}>View Roster</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.qrBtn}
            onPress={() =>
              router.push({ pathname: '/qr-display/[instanceId]', params: { instanceId } })
            }
          >
            <Text style={styles.qrBtnText}>Show QR Code</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!cls.isUserBooked && !cls.isUserWaitlisted ? (
        <TouchableOpacity
          style={[styles.bookBtn, cls.isFull && styles.waitlistBtn]}
          onPress={handleBook}
          disabled={bookMutation.isPending || waitlistMutation.isPending}
        >
          <Text style={styles.bookBtnText}>{cls.isFull ? 'Join Waitlist' : 'Book Class'}</Text>
        </TouchableOpacity>
      ) : cls.isUserBooked ? (
        <View style={styles.bookedRow}>
          <View style={styles.bookedBadge}>
            <Text style={styles.bookedBadgeText}>✓ Confirmed</Text>
          </View>
          {cls.bookingId ? (
            <TouchableOpacity
              style={styles.cancelLink}
              onPress={() => handleCancel(cls.bookingId)}
            >
              <Text style={styles.cancelLinkText}>Cancel</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.badgeText, { color: '#92400E' }]}>⏳ On Waitlist</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  content: { padding: 20, gap: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#DC2626' },
  className: { fontSize: 26, fontWeight: '700', color: '#111827' },
  dateText: { fontSize: 15, color: '#6B7280' },
  timeText: { fontSize: 15, color: '#6B7280' },
  infoGrid: { flexDirection: 'row', gap: 12 },
  infoChip: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    flex: 1, borderWidth: 1, borderColor: '#E5E7EB', gap: 4,
  },
  infoChipLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' },
  infoChipValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  section: { gap: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  description: { fontSize: 14, color: '#6B7280', lineHeight: 22 },
  joinBtn: {
    backgroundColor: '#EFF6FF', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE',
  },
  joinBtnText: { color: '#1D4ED8', fontWeight: '600', fontSize: 15 },
  teacherActions: { flexDirection: 'row', gap: 12 },
  rosterBtn: {
    flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  rosterBtnText: { color: '#374151', fontWeight: '600', fontSize: 14 },
  qrBtn: {
    flex: 1, backgroundColor: '#F0FDF4', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  qrBtnText: { color: '#4A6741', fontWeight: '600', fontSize: 14 },
  bookBtn: { backgroundColor: '#4A6741', borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  waitlistBtn: { backgroundColor: '#C68E5D' },
  bookBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  bookedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookedBadge: { backgroundColor: '#D1FAE5', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  bookedBadgeText: { color: '#065F46', fontWeight: '700', fontSize: 15 },
  cancelLink: { padding: 10 },
  cancelLinkText: { color: '#DC2626', fontWeight: '500', fontSize: 14 },
  badge: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'flex-start' },
  badgeText: { fontWeight: '600', fontSize: 14 },
});
