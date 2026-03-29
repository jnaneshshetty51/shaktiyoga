import { useState, useMemo } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSchedule, useBookClass, useJoinWaitlist } from '../../src/hooks';

function getWeekDates() {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function toYMD(d: Date) {
  return d.toISOString().split('T')[0];
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function spotsColor(remaining: number, capacity: number) {
  const pct = remaining / capacity;
  if (pct > 0.4) return '#16A34A';
  if (pct > 0.15) return '#D97706';
  return '#DC2626';
}

export default function ScheduleScreen() {
  const weekDates = useMemo(() => getWeekDates(), []);
  const [selectedDate, setSelectedDate] = useState(0);
  const from = toYMD(weekDates[0]);
  const to = toYMD(weekDates[6]);
  const { data, isLoading } = useSchedule(from, to);
  const bookMutation = useBookClass();
  const waitlistMutation = useJoinWaitlist();

  const selectedDateStr = toYMD(weekDates[selectedDate]);
  const dayClasses = (data?.instances ?? []).filter((c: any) =>
    c.date?.startsWith(selectedDateStr)
  );

  async function handleBook(instance: any) {
    try {
      if (instance.isFull) {
        await waitlistMutation.mutateAsync(instance.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Waitlisted', 'You have been added to the waitlist.');
      } else {
        await bookMutation.mutateAsync(instance.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Booked!', 'Your class has been confirmed.');
      }
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', e.message ?? 'Could not complete booking.');
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateStrip}
        contentContainerStyle={styles.dateContent}
      >
        {weekDates.map((d, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.dateChip, selectedDate === i && styles.dateChipActive]}
            onPress={() => setSelectedDate(i)}
          >
            <Text style={[styles.dayName, selectedDate === i && styles.dateChipActiveText]}>
              {d.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase()}
            </Text>
            <Text style={[styles.dayNum, selectedDate === i && styles.dateChipActiveText]}>
              {d.getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list}>
        {isLoading ? (
          <ActivityIndicator color="#4A6741" style={{ marginTop: 40 }} />
        ) : dayClasses.length === 0 ? (
          <Text style={styles.emptyText}>No classes on this day</Text>
        ) : (
          dayClasses.map((cls: any) => {
            const remaining = cls.capacity - (cls.bookedCount ?? 0);
            return (
              <View key={cls.id} style={styles.classCard}>
                <View style={styles.cardTop}>
                  <Text style={styles.className}>{cls.batch?.name ?? cls.name}</Text>
                  <Text style={[styles.spots, { color: spotsColor(remaining, cls.capacity) }]}>
                    {remaining > 0 ? `${remaining} spots` : 'Full'}
                  </Text>
                </View>
                <Text style={styles.classTime}>{formatTime(cls.date)}</Text>
                {cls.batch?.description ? (
                  <Text style={styles.classDesc} numberOfLines={2}>
                    {cls.batch.description}
                  </Text>
                ) : null}
                <View style={styles.cardBottom}>
                  {cls.isUserBooked ? (
                    <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
                      <Text style={[styles.badgeText, { color: '#065F46' }]}>✓ Booked</Text>
                    </View>
                  ) : cls.isUserWaitlisted ? (
                    <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={[styles.badgeText, { color: '#92400E' }]}>⏳ Waitlisted</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.bookBtn, cls.isFull && styles.waitlistBtn]}
                      onPress={() => handleBook(cls)}
                      disabled={bookMutation.isPending || waitlistMutation.isPending}
                    >
                      <Text style={styles.bookBtnText}>{cls.isFull ? 'Join Waitlist' : 'Book'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  dateStrip: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    maxHeight: 80,
  },
  dateContent: { paddingHorizontal: 12, paddingVertical: 12, gap: 8, flexDirection: 'row' },
  dateChip: {
    width: 52,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  dateChipActive: { backgroundColor: '#4A6741' },
  dateChipActiveText: { color: '#fff' },
  dayName: { fontSize: 10, fontWeight: '600', color: '#9CA3AF' },
  dayNum: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 2 },
  list: { padding: 16, gap: 12 },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 60, fontSize: 16 },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  className: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  spots: { fontSize: 13, fontWeight: '600' },
  classTime: { fontSize: 14, color: '#6B7280' },
  classDesc: { fontSize: 13, color: '#9CA3AF' },
  cardBottom: { marginTop: 8 },
  badge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  badgeText: { fontSize: 13, fontWeight: '600' },
  bookBtn: {
    backgroundColor: '#4A6741',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  waitlistBtn: { backgroundColor: '#C68E5D' },
  bookBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
