import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Switch, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../../src/store/auth';
import { apiFetch } from '../../src/lib/api';

export default function ProfileScreen() {
  const { user, setAuth, clearAuth, accessToken } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);

  const isTeacher = ['TEACHER', 'STAFF_ADMIN', 'SUPER_ADMIN'].includes(user?.role ?? '');
  const isAdmin = ['STAFF_ADMIN', 'SUPER_ADMIN'].includes(user?.role ?? '');

  async function handleSave() {
    setSaving(true);
    try {
      const data = await apiFetch<any>('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ name }),
      });
      if (user) {
        await setAuth({ ...user, name: data.user?.name ?? name }, accessToken ?? '');
      }
      setEditing(false);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePushToggle(value: boolean) {
    setPushEnabled(value);
    if (!value) {
      await apiFetch('/api/users/push-token', { method: 'DELETE' }).catch(() => {});
    } else {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        setPushEnabled(false);
        Alert.alert('Permission denied', 'Enable notifications in your phone settings.');
      }
    }
  }

  async function handleLogout() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
          await clearAuth();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? 'Y'}</Text>
        </View>
        {editing ? (
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            autoFocus
          />
        ) : (
          <Text style={styles.nameText}>{user?.name ?? 'Yogi'}</Text>
        )}
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role ?? 'MEMBER'}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{user?.phone ?? '—'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email ?? '—'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={pushEnabled}
            onValueChange={handlePushToggle}
            trackColor={{ false: '#E5E7EB', true: '#A7C4A0' }}
            thumbColor={pushEnabled ? '#4A6741' : '#9CA3AF'}
          />
        </View>
      </View>

      {isTeacher && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TEACHER TOOLS</Text>
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/scan')}>
            <Text style={styles.actionText}>📷 Scan QR Attendance</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {isAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ADMIN</Text>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/(admin)/dashboard')}
          >
            <Text style={styles.actionText}>📊 Admin Dashboard</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttons}>
        {editing ? (
          <>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => { setEditing(false); setName(user?.name ?? ''); }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  content: { padding: 20, gap: 20 },
  avatarSection: { alignItems: 'center', gap: 10, paddingTop: 16 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#4A6741', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: '700' },
  nameText: { fontSize: 24, fontWeight: '700', color: '#111827' },
  nameInput: {
    fontSize: 22, fontWeight: '700', color: '#111827',
    borderBottomWidth: 2, borderBottomColor: '#4A6741',
    paddingBottom: 4, minWidth: 180, textAlign: 'center',
  },
  roleBadge: { backgroundColor: '#F0FDF4', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  roleText: { fontSize: 12, color: '#4A6741', fontWeight: '600' },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  infoLabel: { fontSize: 14, color: '#9CA3AF' },
  infoValue: { fontSize: 15, color: '#111827', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  section: { gap: 10 },
  sectionLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '700', letterSpacing: 1 },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB',
  },
  settingLabel: { fontSize: 15, color: '#111827' },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB',
  },
  actionText: { fontSize: 15, color: '#111827' },
  chevron: { fontSize: 20, color: '#9CA3AF' },
  buttons: { gap: 12, paddingTop: 8 },
  editBtn: { backgroundColor: '#F3F4F6', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  editBtnText: { color: '#4A6741', fontWeight: '600', fontSize: 15 },
  saveBtn: { backgroundColor: '#4A6741', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  cancelBtn: { paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { color: '#6B7280', fontSize: 15 },
  logoutBtn: {
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#FEE2E2', borderRadius: 12, backgroundColor: '#FFF5F5',
  },
  logoutText: { color: '#DC2626', fontWeight: '600', fontSize: 15 },
});
