/**
 * Push notification delivery via Expo Push API.
 * https://docs.expo.dev/push-notifications/sending-notifications/
 */

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CHUNK_SIZE = 100; // Expo's max per request

export interface PushMessage {
  to: string | string[]; // Expo push token(s)
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string; // Android notification channel
}

/**
 * Send push notifications to one or more Expo push tokens.
 * Automatically batches into chunks of 100 per Expo API limits.
 */
export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const validTokens = tokens.filter(
    (t) => t && (t.startsWith('ExponentPushToken[') || t.startsWith('ExpoPushToken['))
  );

  if (validTokens.length === 0) return;

  // Split into chunks
  const chunks: string[][] = [];
  for (let i = 0; i < validTokens.length; i += CHUNK_SIZE) {
    chunks.push(validTokens.slice(i, i + CHUNK_SIZE));
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (process.env.EXPO_ACCESS_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;
  }

  for (const chunk of chunks) {
    const messages: PushMessage[] = chunk.map((token) => ({
      to: token,
      title,
      body,
      data: data ?? {},
      sound: 'default',
      channelId: 'default',
    }));

    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(messages),
      });

      if (!res.ok) {
        console.error('[push] Expo API error:', res.status, await res.text());
      }
    } catch (err) {
      console.error('[push] Network error sending push:', err);
    }
  }
}

/**
 * Send a push notification to a single token.
 */
export async function sendPushToUser(
  token: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  return sendPushNotification([token], title, body, data);
}
