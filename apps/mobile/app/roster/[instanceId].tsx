import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Switch,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useRoster, useManualAttendance } from '../../src/hooks';

type AttendanceStatus = 'PRESENT' | 'NO_SHOW' | undefined;

export default function RosterScreen() {
  const { instanceId } = useLocalSearchParams<{ instanceId: string }>();
  const { data, isLoading, refetch } = useRoster(instanceId);
  const manualMutation = useManualAttendance();
  const [changes, setChanges] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);

  const roster = data?.roster ?? [];

  function getStatus(item: any): AttendanceStatus {
    if (changes[item.userId] !== undefined) return changes[item.userId];
    return item.attendance?.status;
  }

  function toggleStatus(userId: string, current: AttendanceStatus) {
    setChanges((prev) => ({
      ...prev,
      [userId]: current === 'PRESENT' ? 'NO_SHOW' : 'PRESENT',
    }));
  }

  async function handleSave() {
    const entries = Object.entries(changes);
    if (!entries.length) {
      Alert.alert('No changes', 'No attendance changes to save.');
      return;
    }
    setSaving(true);
    try {
      await Promise.all(
        entries.map(([userId, status]) =>
          manualMutation.mutateAsync({ userId, instanceId, status: status! })
        )
      );
      setChanges({});
      refetch();
      Alert.alert('Saved', 'Attendance has been updated.');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save attendance.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.summary}>
          {data?.summary?.present ?? 0} present · {data?.summary?.noShow ?? 0} no-show · {data?.summary?.total ?? 0} total
        </Text>
        <TouchableOpacity
          style={[styles.saveBtn, !Object.keys(changes).length && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving || !Object.keys(changes).length}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#4A6741" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={roster}
          keyExtractor={(item: any) => item.userId}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No bookings for this class</Text>}
          renderItem={({ item }: { item: any }) => {
            const status = getStatus(item);
            const isPresent = status === 'PRESENT';
            const hasChange = changes[item.userId] !== undefined;
            return (
              <View style={[styles.row, hasChange && styles.rowChanged]}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{item.user?.name?.[0] ?? '?'}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.user?.name ?? 'Unknown'}</Text>
                  <Text style={styles.phone}>{item.user?.phone ?? item.user?.email ?? ''}</Text>
                </View>
                <View style={styles.toggleCol}>
                  <Text style={[
                    styles.toggleLabel,
                    isPresent ? styles.labelPresent : styles.labelAbsent,
                  ]}>
                    {isPresent ? 'Present' : status === 'NO_SHOW' ? 'No Show' : 'Not Marked'}
                  </Text>
                  <Switch
                    value={isPresent}
                    onValueChange={() => toggleStatus(item.userId, status)}
                    trackColor={{ false: '#E5E7EB', true: '#A7C4A0' }}
                    thumbColor={isPresent ? '#4A6741' : '#9CA3AF'}
                  />
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  summary: { fontSize: 14, color: '#6B7280' },
  saveBtn: { backgroundColor: '#4A6741', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  saveBtnDisabled: { backgroundColor: '#D1D5DB' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 12, gap: 8 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 60, fontSize: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#E5E7EB', gap: 12,
  },
  rowChanged: { borderColor: '#4A6741', backgroundColor: '#F0FDF4' },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#4A6741', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  phone: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  toggleCol: { alignItems: 'flex-end', gap: 4 },
  toggleLabel: { fontSize: 12, fontWeight: '600' },
  labelPresent: { color: '#16A34A' },
  labelAbsent: { color: '#DC2626' },
});
