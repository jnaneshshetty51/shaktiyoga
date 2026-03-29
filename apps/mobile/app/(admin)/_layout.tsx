import { Stack, router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../src/store/auth';

export default function AdminLayout() {
  const { user } = useAuthStore();
  const isAdmin = ['STAFF_ADMIN', 'SUPER_ADMIN'].includes(user?.role ?? '');

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }}>Access Denied</Text>
        <Text style={{ fontSize: 15, color: '#6B7280' }}>Admin access required.</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={{ color: '#4A6741', fontWeight: '500', fontSize: 15 }}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#FAFAF8' },
        headerTintColor: '#111827',
      }}
    >
      <Stack.Screen name="dashboard" options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="record-payment" options={{ title: 'Record Payment' }} />
    </Stack>
  );
}
