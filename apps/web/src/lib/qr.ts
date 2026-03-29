import QRCode from 'qrcode';
import { signToken, verifyToken } from './auth';

export interface QrPayload {
  instanceId: string;
  date: string; // ISO date string "YYYY-MM-DD"
}

/**
 * Generate a QR code data URL for a class instance.
 * The QR encodes a 12-hour JWT signed with QR_JWT_SECRET.
 */
export async function generateQrDataUrl(instanceId: string, date: Date): Promise<{
  qrDataUrl: string;
  token: string;
  expiresAt: Date;
}> {
  const expiresAt = new Date(date);
  expiresAt.setHours(expiresAt.getHours() + 12);

  const token = await signToken(
    {
      instanceId,
      date: date.toISOString().split('T')[0],
    } satisfies QrPayload,
    'qr'
  );

  const qrDataUrl = await QRCode.toDataURL(token, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    margin: 2,
    width: 400,
  });

  return { qrDataUrl, token, expiresAt };
}

/**
 * Verify a QR token and extract the payload.
 * Returns null if invalid or expired.
 */
export async function verifyQrToken(token: string): Promise<QrPayload | null> {
  const payload = await verifyToken(token, 'qr');
  if (!payload) return null;

  const { instanceId, date } = payload;
  if (typeof instanceId !== 'string' || typeof date !== 'string') return null;

  return { instanceId, date };
}
