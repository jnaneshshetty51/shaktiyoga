import { RRule, Weekday } from 'rrule';

// ─── Day-of-week mapping ──────────────────────────────────────────────────────

const DAY_MAP: Record<string, Weekday> = {
  Sun: RRule.SU,
  Mon: RRule.MO,
  Tue: RRule.TU,
  Wed: RRule.WE,
  Thu: RRule.TH,
  Fri: RRule.FR,
  Sat: RRule.SA,
  // Also accept full names
  Sunday: RRule.SU,
  Monday: RRule.MO,
  Tuesday: RRule.TU,
  Wednesday: RRule.WE,
  Thursday: RRule.TH,
  Friday: RRule.FR,
  Saturday: RRule.SA,
};

type BatchScheduleInput = {
  daysOfWeek: string[];
  rrule?: string | null;
  timeSlot: string; // "06:00" (24h) or "06:00 AM"
  timezone?: string;
};

/**
 * Expand a ClassBatch into concrete Date occurrences between `from` and `to`.
 *
 * Handles two formats:
 * 1. Legacy daysOfWeek[] + timeSlot string → constructs RRULE internally
 * 2. Explicit RFC 5545 RRULE string stored on the batch
 */
export function expandBatchDates(
  batch: BatchScheduleInput,
  from: Date,
  to: Date
): Date[] {
  if (batch.rrule) {
    try {
      const rule = RRule.fromString(batch.rrule);
      return rule.between(from, to, true);
    } catch {
      // Fall through to legacy handling
    }
  }

  const byweekday = batch.daysOfWeek
    .map((d) => DAY_MAP[d])
    .filter(Boolean);

  if (byweekday.length === 0) return [];

  const { hours, minutes } = parseTimeSlot(batch.timeSlot);

  const rule = new RRule({
    freq: RRule.WEEKLY,
    byweekday,
    dtstart: from,
    until: to,
    byhour: [hours],
    byminute: [minutes],
    bysecond: [0],
  });

  return rule.all();
}

/**
 * Parse a time slot string like "06:00", "6:00 AM", "18:30" into { hours, minutes }.
 */
function parseTimeSlot(timeSlot: string): { hours: number; minutes: number } {
  // Handle "HH:MM AM/PM" format
  const amPmMatch = timeSlot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (amPmMatch) {
    let hours = parseInt(amPmMatch[1]);
    const minutes = parseInt(amPmMatch[2]);
    const period = amPmMatch[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
  }

  // Handle "HH:MM" 24h format
  const match = timeSlot.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    return { hours: parseInt(match[1]), minutes: parseInt(match[2]) };
  }

  // Default to 6 AM if unparseable
  return { hours: 6, minutes: 0 };
}

/**
 * Format a Date as a display time string (IST).
 * e.g. "06:00 AM - 07:00 AM IST"
 */
export function formatClassTime(date: Date, durationMins: number): string {
  const start = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  const end = new Date(date.getTime() + durationMins * 60 * 1000).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  return `${start} - ${end} IST`;
}

/**
 * Check if a class instance is happening "today" (IST).
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const istToday = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return (
    istDate.getFullYear() === istToday.getFullYear() &&
    istDate.getMonth() === istToday.getMonth() &&
    istDate.getDate() === istToday.getDate()
  );
}

/**
 * Get the start of day in IST for a given date.
 */
export function startOfDayIST(date: Date): Date {
  const ist = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  ist.setHours(0, 0, 0, 0);
  return ist;
}

/**
 * Get date N days from now.
 */
export function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
