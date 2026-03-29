import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, Linking,
} from 'react-native';
import { useMyBookings, useCancelBooking } from '../../src/hooks';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function AttendanceBadge({ status }: { status?: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    PRESENT:  { bg: '#D1FAE5', fg: '#065F46', label: '✓ Present' },
    NO_SHOW:  { bg: '#FEE2E2', fg: '#991B1B', label: '✗ No Show' },
  };
  const s = map[status ?? ''] ?? { bg: '#F3F4F6', fg: '#6B7280', label: 'Not Marked' };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

export default function BookingsScreen() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const { data, isLoading, refetch } = useMyBookings(tab);
  const cancelMutation = useCancelBooking();
  const bookings = data?.bookings ?? [];

  async function handleCancel(bookingId: string) {
    Alert.alert('Cancel class?', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelMutation.mutateAsync(bookingId);
            refetch();
          } catch (e: any) {
            Alert.alert('Error', e.message ?? 'Could not cancel booking.');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'upcoming' && styles.activeTab]}
          onPress={() => setTab('upcoming')}
        >
          <Text style={[styles.tabText, tab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'past' && styles.activeTab]}
          onPress={() => setTab('past')}
        >
          <Text style={[styles.tabText, tab === 'past' && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#4A6741" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b: any) => b.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No {tab} bookings</Text>}
          renderItem={({ item: b }: { item: any }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.className}>{b.instance?.batch?.name ?? 'Yoga Class'}</Text>
                {tab === 'past' ? (
                  <AttendanceBadge status={b.attendance?.status} />
                ) : (
                  <TouchableOpacity
                    onPress={() => handleCancel(b.id)}
                    disabled={cancelMutation.isPending}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.dateText}>
                {formatDate(b.instance?.date)} • {formatTime(b.instance?.date)}
              </Text>
              {tab === 'upcoming' && b.instance?.meetingLink ? (
                <TouchableOpacity onPress={() => Linking.openURL(b.instance.meetingLink)}>
                  <Text style={styles.linkText}>🔗 Join online class</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: '#4A6741' },
  tabText: { fontSize: 15, color: '#9CA3AF', fontWeight: '500' },
  activeTabText: { color: '#4A6741', fontWeight: '700' },
  list: { padding: 16, gap: 12 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 60, fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  className: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  cancelText: { fontSize: 13, color: '#DC2626', fontWeight: '500' },
  dateText: { fontSize: 14, color: '#6B7280' },
  linkText: { fontSize: 14, color: '#4A6741', fontWeight: '500' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
});
