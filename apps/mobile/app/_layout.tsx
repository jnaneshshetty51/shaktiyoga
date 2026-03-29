import { useEffect, useRef } from 'react';
import { router, Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { ActivityIndicator, View } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function AuthGuard() {
  const { isLoading, user, initialize } = useAuthStore();
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        registerPushToken();
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, user]);

  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as any;
      switch (data?.type) {
        case 'BOOKING_CONFIRMED':
        case 'WAITLIST_PROMOTED':
        case 'NO_SHOW':
          router.push('/(tabs)/bookings');
          break;
        case 'CLASS_CANCELLED':
          router.push('/(tabs)/schedule');
          break;
        case 'PAYMENT_SUCCESS':
        case 'MEMBERSHIP_EXPIRING':
          router.push('/(tabs)/membership');
          break;
      }
    });
    return () => {
      responseListener.current?.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF8' }}>
        <ActivityIndicator size="large" color="#4A6741" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="class/[instanceId]" options={{ presentation: 'modal', headerShown: true, title: 'Class Details' }} />
      <Stack.Screen name="scan" options={{ headerShown: true, title: 'Scan QR Code' }} />
      <Stack.Screen name="qr-display/[instanceId]" options={{ headerShown: true, title: 'Class QR Code' }} />
      <Stack.Screen name="roster/[instanceId]" options={{ headerShown: true, title: 'Class Roster' }} />
      <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
      <Stack.Screen name="payment-success" options={{ headerShown: false }} />
    </Stack>
  );
}

async function registerPushToken() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return;
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    await apiFetch('/api/users/push-token', {
      method: 'POST',
      body: JSON.stringify({ token: token.data }),
    });
  } catch {
    // Push registration optional
  }
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
    </QueryClientProvider>
  );
}
