// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'SUPER_ADMIN'
  | 'STAFF_ADMIN'
  | 'TEACHER'
  | 'MEMBER_EVERYDAY'
  | 'MEMBER_THERAPY'
  | 'TRIAL'
  | 'VISITOR';

export interface UserDTO {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  timezone: string;
  expoPushToken?: string;
  phoneVerified: boolean;
}

// ─── Class Schedule ──────────────────────────────────────────────────────────

export interface ClassInstanceDTO {
  id: string;
  batchId: string;
  batchName: string;
  planType: 'EVERYDAY_YOGA' | 'YOGA_THERAPY' | 'TRIAL';
  date: string; // ISO string
  startTime: string; // "06:00 AM"
  endTime: string; // "07:00 AM"
  durationMins: number;
  teacher: string;
  teacherId: string;
  capacity: number;
  bookedCount: number;
  isFull: boolean;
  meetingLink?: string | null;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  // Only present when authenticated
  isUserBooked?: boolean;
  userBookingId?: string;
  userWaitlistPosition?: number;
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED';

export interface BookingDTO {
  id: string;
  instance: ClassInstanceDTO;
  status: BookingStatus;
  bookedAt: string;
  cancelledAt?: string | null;
}

// ─── Membership Plans ────────────────────────────────────────────────────────

export interface MembershipDTO {
  id: string;
  name: string;
  planType: 'EVERYDAY_YOGA' | 'YOGA_THERAPY' | 'TRIAL';
  durationDays: number;
  price: number;
  currency: string;
  classesPerWeek?: number | null;
  sessionsTotal?: number | null;
  description?: string | null;
  features: string[];
}

export interface UserMembershipDTO {
  id: string;
  membership: MembershipDTO;
  startDate: string;
  renewalDate: string;
  endDate?: string | null;
  status: 'ACTIVE' | 'CANCELLED' | 'PAUSED' | 'TRIAL' | 'EXPIRED';
  razorpaySubscriptionId?: string | null;
}

// ─── Payments ────────────────────────────────────────────────────────────────

export interface CreateOrderRequest {
  membershipId: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number; // paise (100 = ₹1)
  currency: string;
  keyId: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  membershipId: string;
}

export interface PaymentDTO {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
  razorpayPaymentId?: string | null;
  invoiceUrl?: string | null;
  invoiceNumber?: string | null;
  description?: string | null;
  createdAt: string;
}

// ─── Auth / OTP ──────────────────────────────────────────────────────────────

export interface SendOtpRequest {
  phone: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
  deviceId?: string;
  deviceType?: 'ios' | 'android' | 'web';
}

export interface AuthResponse {
  user: UserDTO;
}

// ─── Attendance / QR ─────────────────────────────────────────────────────────

export interface ScanAttendanceRequest {
  qrToken: string;
}

export interface ScanAttendanceResponse {
  success: boolean;
  userName: string;
  checkInAt: string;
  instanceId: string;
}

export interface AttendanceDTO {
  id: string;
  userId: string;
  userName: string;
  instanceId: string;
  status: 'PRESENT' | 'NO_SHOW' | 'EXCUSED';
  checkInAt?: string | null;
  checkInMethod?: string | null;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface PushTokenRequest {
  token: string;
  deviceType?: 'ios' | 'android';
}

export interface NotificationDTO {
  id: string;
  title: string;
  body: string;
  channel: string;
  readAt?: string | null;
  createdAt: string;
}

// ─── Waitlist ────────────────────────────────────────────────────────────────

export interface WaitlistDTO {
  id: string;
  instanceId: string;
  position: number;
  status: 'WAITING' | 'PROMOTED' | 'EXPIRED';
  createdAt: string;
}

// ─── API helpers ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  error: string;
  code?: string;
  field?: string;
}
