import { ScrollView, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAdminStats, useSchedule } from '../../src/hooks';

function toYMD(d: Date) {
  return d.toISOString().split('T')[0];
}

function formatAmount(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);
}

function KpiCard({
  label, value, sub, color = '#4A6741',
}: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      {sub ? <Text style={styles.kpiSub}>{sub}</Text> : null}
    </View>
  );
}

export default function AdminDashboardScreen() {
  const { data: stats, isLoading } = useAdminStats();
  const today = new Date();
  const { data: scheduleData } = useSchedule(toYMD(today), toYMD(today));
  const todayClasses = scheduleData?.instances ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isLoading ? (
        <ActivityIndicator color="#4A6741" style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.kpiGrid}>
            <KpiCard label="MRR" value={formatAmount(stats?.mrr ?? 0)} sub="Monthly recurring" />
            <KpiCard
              label="Active Members"
              value={stats?.activeMembers ?? 0}
              sub="With valid plan"
              color="#2563EB"
            />
            <KpiCard
              label="Today's Classes"
              value={stats?.todayClassCount ?? todayClasses.length}
              sub="Scheduled today"
              color="#D97706"
            />
            <KpiCard
              label="Total Bookings"
              value={stats?.totalBookings ?? 0}
              sub="All time"
              color="#7C3AED"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            {todayClasses.length === 0 ? (
              <Text style={styles.emptyText}>No classes scheduled today</Text>
            ) : (
              todayClasses.map((cls: any) => (
                <TouchableOpacity
                  key={cls.id}
                  style={styles.classRow}
                  onPress={() =>
                    router.push({
                      pathname: '/roster/[instanceId]',
                      params: { instanceId: cls.id },
                    })
                  }
                >
                  <View>
                    <Text style={styles.className}>{cls.batch?.name ?? cls.name}</Text>
                    <Text style={styles.classTime}>
                      {new Date(cls.date).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit', hour12: true,
                      })}
                      {' · '}{cls.bookedCount ?? 0}/{cls.capacity} booked
                    </Text>
                  </View>
                  <View style={styles.rosterBtn}>
                    <Text style={styles.rosterBtnText}>Roster →</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(admin)/record-payment')}
          >
            <Text style={styles.actionBtnText}>+ Record Manual Payment</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  content: { padding: 16, gap: 20 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpiCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#E5E7EB', gap: 4,
  },
  kpiLabel: {
    fontSize: 11, color: '#9CA3AF', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  kpiValue: { fontSize: 24, fontWeight: '700' },
  kpiSub: { fontSize: 12, color: '#9CA3AF' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  emptyText: { color: '#9CA3AF', textAlign: 'center', paddingVertical: 16 },
  classRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB',
  },
  className: { fontSize: 15, fontWeight: '600', color: '#111827' },
  classTime: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  rosterBtn: { backgroundColor: '#F0FDF4', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  rosterBtnText: { color: '#4A6741', fontWeight: '600', fontSize: 13 },
  actionBtn: { backgroundColor: '#4A6741', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
