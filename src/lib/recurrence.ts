import {
  addDays,
  addWeeks,
  addMonths,
  setDay,
  getDay,
  format,
  isBefore,
  differenceInMilliseconds,
} from 'date-fns';

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];   // 0=Sun..6=Sat
  dayOfMonth?: number;     // 1-31
  endType: 'after' | 'until';
  endAfterCount?: number;
  endUntilDate?: string;   // ISO date
}

const MAX_OCCURRENCES = 52;

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Occurrence {
  startTime: Date;
  endTime?: Date;
}

/**
 * Generate all occurrences for a recurring event.
 */
export function generateOccurrences(
  startTime: Date,
  endTime: Date | undefined,
  rule: RecurrenceRule,
): Occurrence[] {
  const duration = endTime ? differenceInMilliseconds(endTime, startTime) : 0;
  const maxCount = rule.endType === 'after'
    ? Math.min(rule.endAfterCount || 1, MAX_OCCURRENCES)
    : MAX_OCCURRENCES;
  const untilDate = rule.endType === 'until' && rule.endUntilDate
    ? new Date(rule.endUntilDate)
    : null;

  const occurrences: Occurrence[] = [];

  if (rule.frequency === 'daily') {
    let current = new Date(startTime);
    while (occurrences.length < maxCount) {
      if (untilDate && isBefore(untilDate, current)) break;
      const occ: Occurrence = { startTime: new Date(current) };
      if (duration > 0) occ.endTime = new Date(current.getTime() + duration);
      occurrences.push(occ);
      current = addDays(current, rule.interval);
    }
  } else if (rule.frequency === 'weekly') {
    const days = rule.daysOfWeek && rule.daysOfWeek.length > 0
      ? [...rule.daysOfWeek].sort((a, b) => a - b)
      : [getDay(startTime)];

    // Start from the week of the start date
    let weekStart = new Date(startTime);
    let found = false;

    outer:
    while (occurrences.length < maxCount) {
      for (const dayOfWeek of days) {
        const candidate = setDay(weekStart, dayOfWeek, { weekStartsOn: 0 });
        // Skip dates before the original start
        if (!found && isBefore(candidate, startTime)) continue;
        found = true;
        if (untilDate && isBefore(untilDate, candidate)) break outer;
        if (occurrences.length >= maxCount) break outer;

        const occ: Occurrence = { startTime: new Date(candidate) };
        // Preserve the time from the original start
        occ.startTime.setHours(startTime.getHours(), startTime.getMinutes(), startTime.getSeconds());
        if (duration > 0) occ.endTime = new Date(occ.startTime.getTime() + duration);
        occurrences.push(occ);
      }
      weekStart = addWeeks(weekStart, rule.interval);
    }
  } else if (rule.frequency === 'monthly') {
    let current = new Date(startTime);
    if (rule.dayOfMonth) {
      current.setDate(Math.min(rule.dayOfMonth, daysInMonth(current)));
    }
    while (occurrences.length < maxCount) {
      if (untilDate && isBefore(untilDate, current)) break;
      const occ: Occurrence = { startTime: new Date(current) };
      if (duration > 0) occ.endTime = new Date(current.getTime() + duration);
      occurrences.push(occ);
      current = addMonths(current, rule.interval);
      if (rule.dayOfMonth) {
        current.setDate(Math.min(rule.dayOfMonth, daysInMonth(current)));
      }
    }
  }

  return occurrences;
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Human-readable summary of a recurrence rule.
 */
export function describeRecurrence(rule: RecurrenceRule): string {
  let desc = 'Repeats ';

  if (rule.frequency === 'daily') {
    desc += rule.interval === 1 ? 'every day' : `every ${rule.interval} days`;
  } else if (rule.frequency === 'weekly') {
    const days = rule.daysOfWeek && rule.daysOfWeek.length > 0
      ? rule.daysOfWeek.map((d) => FULL_DAY_LABELS[d]).join(', ')
      : '';
    if (rule.interval === 1) {
      desc += days ? `every ${days}` : 'every week';
    } else {
      desc += days ? `every ${rule.interval} weeks on ${days}` : `every ${rule.interval} weeks`;
    }
  } else if (rule.frequency === 'monthly') {
    const dayStr = rule.dayOfMonth ? `on the ${ordinal(rule.dayOfMonth)}` : '';
    if (rule.interval === 1) {
      desc += dayStr ? `every month ${dayStr}` : 'every month';
    } else {
      desc += dayStr ? `every ${rule.interval} months ${dayStr}` : `every ${rule.interval} months`;
    }
  }

  if (rule.endType === 'after' && rule.endAfterCount) {
    desc += `, ${rule.endAfterCount} times`;
  } else if (rule.endType === 'until' && rule.endUntilDate) {
    desc += ` until ${format(new Date(rule.endUntilDate), 'MMM d, yyyy')}`;
  }

  return desc;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export { DAY_LABELS };
