import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { setAccessToken } from '../lib/api';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'MEMBER' | 'TEACHER' | 'STAFF_ADMIN' | 'SUPER_ADMIN';
  expoPushToken?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken?: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  initialize: () => Promise<void>;
}

const REFRESH_TOKEN_KEY = 'refresh_token';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  setAuth: async (user, accessToken, refreshToken) => {
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
    setAccessToken(accessToken);
    set({ user, accessToken, isLoading: false });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => {});
    setAccessToken(null);
    set({ user: null, accessToken: null, isLoading: false });
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        set({ isLoading: false });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Constants = require('expo-constants').default;
      const API_BASE: string = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:3000';

      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { Cookie: `refresh_token=${refreshToken}` },
      });

      if (!res.ok) {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => {});
        set({ isLoading: false });
        return;
      }

      const data = await res.json();
      setAccessToken(data.accessToken);

      const meRes = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      });

      if (meRes.ok) {
        const me = await meRes.json();
        set({ user: me.user, accessToken: data.accessToken, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
