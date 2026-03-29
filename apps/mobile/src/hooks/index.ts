import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

// ─── Schedule ───────────────────────────────────────────────────────────────

export function useSchedule(from: string, to: string, planType?: string) {
  const params = new URLSearchParams({ from, to });
  if (planType) params.set('planType', planType);
  return useQuery({
    queryKey: ['schedule', from, to, planType],
    queryFn: () => apiFetch<any>(`/api/schedule?${params}`),
  });
}

export function useClassDetail(instanceId: string) {
  return useQuery({
    queryKey: ['class', instanceId],
    queryFn: () => apiFetch<any>(`/api/schedule/${instanceId}`),
    enabled: !!instanceId,
  });
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export function useMyBookings(filter: 'upcoming' | 'past' = 'upcoming') {
  return useQuery({
    queryKey: ['bookings', filter],
    queryFn: () => apiFetch<any>(`/api/bookings/my?filter=${filter}`),
  });
}

export function useBookClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (instanceId: string) =>
      apiFetch<any>('/api/bookings', { method: 'POST', body: JSON.stringify({ instanceId }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) =>
      apiFetch<any>(`/api/bookings/${bookingId}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}

export function useJoinWaitlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (instanceId: string) =>
      apiFetch<any>('/api/waitlist', { method: 'POST', body: JSON.stringify({ instanceId }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedule'] }),
  });
}

// ─── Memberships ─────────────────────────────────────────────────────────────

export function useMemberships() {
  return useQuery({
    queryKey: ['memberships'],
    queryFn: () => apiFetch<any>('/api/memberships'),
  });
}

// ─── Payments ────────────────────────────────────────────────────────────────

export function useMyPayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: () => apiFetch<any>('/api/payments/my'),
  });
}

// ─── Attendance ──────────────────────────────────────────────────────────────

export function useQrCode(instanceId: string) {
  return useQuery({
    queryKey: ['qr', instanceId],
    queryFn: () => apiFetch<any>(`/api/attendance/qr/${instanceId}`),
    enabled: !!instanceId,
    refetchInterval: 600_000,
  });
}

export function useRoster(instanceId: string) {
  return useQuery({
    queryKey: ['roster', instanceId],
    queryFn: () => apiFetch<any>(`/api/admin/attendance/${instanceId}`),
    enabled: !!instanceId,
  });
}

export function useScanAttendance() {
  return useMutation({
    mutationFn: (token: string) =>
      apiFetch<any>('/api/attendance/scan', { method: 'POST', body: JSON.stringify({ token }) }),
  });
}

export function useManualAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      instanceId,
      status,
    }: {
      userId: string;
      instanceId: string;
      status: 'PRESENT' | 'NO_SHOW';
    }) =>
      apiFetch<any>('/api/attendance/manual', {
        method: 'POST',
        body: JSON.stringify({ userId, instanceId, status }),
      }),
    onSuccess: (_data, { instanceId }) =>
      qc.invalidateQueries({ queryKey: ['roster', instanceId] }),
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: () => apiFetch<any>('/api/admin/stats'),
  });
}
