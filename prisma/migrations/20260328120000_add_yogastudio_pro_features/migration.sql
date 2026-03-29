-- ─── New Enums ────────────────────────────────────────────────────────────────

CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CAPTURED', 'FAILED', 'REFUNDED');

CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'NO_SHOW', 'EXCUSED');

CREATE TYPE "WaitlistStatus" AS ENUM ('WAITING', 'PROMOTED', 'EXPIRED');

CREATE TYPE "ClassInstanceStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- ─── User table: make email nullable, add new fields ────────────────────────

ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

ALTER TABLE "User" ADD COLUMN "phoneVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "expoPushToken" TEXT;
ALTER TABLE "User" ADD COLUMN "razorpayCustomerId" TEXT;

-- Add unique constraint on phone (skip if there are duplicate phones)
CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone") WHERE "phone" IS NOT NULL;

-- ─── Subscription table: add new fields ──────────────────────────────────────

ALTER TABLE "Subscription" ADD COLUMN "endDate" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN "pausedAt" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN "pausedUntil" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN "freezeDays" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Subscription" ADD COLUMN "razorpayCustomerId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "cancelledAt" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN "cancelReason" TEXT;
-- Add updatedAt with default for existing rows
ALTER TABLE "Subscription" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ─── ClassBatch table: add capacity, scheduling fields ───────────────────────

ALTER TABLE "ClassBatch" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata';
ALTER TABLE "ClassBatch" ADD COLUMN "rrule" TEXT;
ALTER TABLE "ClassBatch" ADD COLUMN "capacity" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "ClassBatch" ADD COLUMN "durationMins" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "ClassBatch" ADD COLUMN "description" TEXT;
ALTER TABLE "ClassBatch" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ClassBatch" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ─── ClassInstance table: add capacity, status enum, timestamps ──────────────

ALTER TABLE "ClassInstance" ADD COLUMN "capacity" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "ClassInstance" ADD COLUMN "meetingLink" TEXT;
ALTER TABLE "ClassInstance" ADD COLUMN "cancelledReason" TEXT;
ALTER TABLE "ClassInstance" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ClassInstance" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Migrate status column from TEXT to ClassInstanceStatus enum
-- First normalize existing text values to uppercase enum values
UPDATE "ClassInstance" SET "status" =
  CASE
    WHEN lower("status") = 'scheduled' THEN 'SCHEDULED'
    WHEN lower("status") = 'live' THEN 'LIVE'
    WHEN lower("status") = 'completed' THEN 'COMPLETED'
    WHEN lower("status") = 'cancelled' THEN 'CANCELLED'
    ELSE 'SCHEDULED'
  END;

ALTER TABLE "ClassInstance" ALTER COLUMN "status" TYPE "ClassInstanceStatus" USING "status"::"ClassInstanceStatus";
ALTER TABLE "ClassInstance" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';

-- ─── New Table: Membership (plan catalog) ────────────────────────────────────

CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "planType" "PlanType" NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "classesPerWeek" INTEGER,
    "sessionsTotal" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "razorpayPlanId" TEXT,
    "description" TEXT,
    "features" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- ─── New Table: Payment ───────────────────────────────────────────────────────

CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "razorpaySubscriptionId" TEXT,
    "invoiceUrl" TEXT,
    "invoiceNumber" TEXT,
    "description" TEXT,
    "failureReason" TEXT,
    "refundId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Payment_razorpayOrderId_key" ON "Payment"("razorpayOrderId") WHERE "razorpayOrderId" IS NOT NULL;
CREATE UNIQUE INDEX "Payment_razorpayPaymentId_key" ON "Payment"("razorpayPaymentId") WHERE "razorpayPaymentId" IS NOT NULL;
CREATE UNIQUE INDEX "Payment_invoiceNumber_key" ON "Payment"("invoiceNumber") WHERE "invoiceNumber" IS NOT NULL;

-- ─── New Table: ClassBooking (group class bookings) ───────────────────────────

CREATE TABLE "ClassBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,

    CONSTRAINT "ClassBooking_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClassBooking_userId_instanceId_key" ON "ClassBooking"("userId", "instanceId");

-- ─── New Table: Attendance ────────────────────────────────────────────────────

CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "checkInAt" TIMESTAMP(3),
    "checkInMethod" TEXT,
    "qrToken" TEXT,
    "markedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Attendance_userId_instanceId_key" ON "Attendance"("userId", "instanceId");

-- ─── New Table: Waitlist ──────────────────────────────────────────────────────

CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'WAITING',
    "notifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Waitlist_userId_instanceId_key" ON "Waitlist"("userId", "instanceId");

-- ─── New Table: DeviceSession (refresh token tracking) ───────────────────────

CREATE TABLE "DeviceSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "deviceType" TEXT,
    "deviceId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeviceSession_refreshToken_key" ON "DeviceSession"("refreshToken");

-- ─── New Table: Notification ──────────────────────────────────────────────────

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- ─── Foreign Keys ─────────────────────────────────────────────────────────────

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ClassBooking" ADD CONSTRAINT "ClassBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClassBooking" ADD CONSTRAINT "ClassBooking_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "ClassInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "ClassInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "ClassInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DeviceSession" ADD CONSTRAINT "DeviceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
