import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useMyBookings } from '../../src/hooks';
import { useAuthStore } from '../../src/store/auth';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { data, isLoading } = useMyBookings('upcoming');

  const upcoming = data?.bookings ?? [];
  const nextClass = upcoming[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.greeting}>
        <Text style={styles.greetText}>Good morning,</Text>
        <Text style={styles.nameText}>{user?.name ?? 'Yogi'} 🙏</Text>
      </View>

      {nextClass ? (
        <TouchableOpacity
          style={styles.nextClassCard}
          onPress={() =>
            router.push({
              pathname: '/class/[instanceId]',
              params: { instanceId: nextClass.instance?.id },
            })
          }
        >
          <Text style={styles.nextLabel}>NEXT CLASS</Text>
          <Text style={styles.nextTitle}>{nextClass.instance?.batch?.name ?? 'Yoga Class'}</Text>
          <Text style={styles.nextTime}>
            {formatDate(nextClass.instance?.date)} • {formatTime(nextClass.instance?.date)}
          </Text>
          {nextClass.instance?.meetingLink ? (
            <View style={styles.onlineBadge}>
              <Text style={styles.onlineBadgeText}>🔗 Online</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      ) : (
        <View style={styles.noClass}>
          <Text style={styles.noClassText}>No upcoming classes</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/schedule')}>
            <Text style={styles.browseLink}>Browse Schedule →</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming ({upcoming.length})</Text>
        {isLoading ? (
          <ActivityIndicator color="#4A6741" />
        ) : (
          upcoming.slice(1, 4).map((b: any) => (
            <View key={b.id} style={styles.bookingRow}>
              <View>
                <Text style={styles.bookingName}>{b.instance?.batch?.name}</Text>
                <Text style={styles.bookingDate}>
                  {formatDate(b.instance?.date)} • {formatTime(b.instance?.date)}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
                <Text style={[styles.statusText, { color: '#065F46' }]}>Booked</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  content: { padding: 20, gap: 20 },
  greeting: { marginBottom: 4 },
  greetText: { fontSize: 16, color: '#6B7280' },
  nameText: { fontSize: 26, fontWeight: '700', color: '#111827' },
  nextClassCard: { backgroundColor: '#4A6741', borderRadius: 16, padding: 20, gap: 8 },
  nextLabel: { fontSize: 11, color: '#A7C4A0', fontWeight: '700', letterSpacing: 1 },
  nextTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  nextTime: { fontSize: 14, color: '#D1FAE5' },
  onlineBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  onlineBadgeText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  noClass: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noClassText: { fontSize: 16, color: '#6B7280' },
  browseLink: { fontSize: 15, color: '#4A6741', fontWeight: '600' },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bookingName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  bookingDate: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
});
