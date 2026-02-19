export interface UISchema {
  textAlign: 'left' | 'center' | 'right';
  imageSize: 'small' | 'medium' | 'large' | 'full';
  imagePosition: 'top' | 'background';
  showDescription: boolean;
  buttonStyle: 'default' | 'minimal' | 'rounded';
}

export const defaultUISchema: UISchema = {
  textAlign: 'left',
  imageSize: 'full',
  imagePosition: 'top',
  showDescription: true,
  buttonStyle: 'default',
};

export type PageType = 'calendar' | 'rsvp' | 'waitlist';

export interface EventData {
  id?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  url?: string;
  imageUrl?: string;
  slug?: string;
  reminderMinutes?: number[];
  uiSchema?: UISchema;
  timezone?: string;
  pageType?: PageType;
  capacity?: number;
  recurrenceRule?: import('./recurrence').RecurrenceRule;
  parentEventId?: string;
  isRecurringParent?: boolean;
  category?: string;
}

export const EVENT_CATEGORIES = [
  'trivia',
  'karaoke',
  'live-music',
  'dj-night',
  'happy-hour',
  'brunch',
  'bingo',
  'open-mic',
  'comedy',
  'sports',
  'theme-night',
  'other',
] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number];

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  'trivia': 'Trivia',
  'karaoke': 'Karaoke',
  'live-music': 'Live Music',
  'dj-night': 'DJ Night',
  'happy-hour': 'Happy Hour',
  'brunch': 'Brunch',
  'bingo': 'Bingo',
  'open-mic': 'Open Mic',
  'comedy': 'Comedy',
  'sports': 'Sports',
  'theme-night': 'Theme Night',
  'other': 'Other',
};

// Common timezone list for dropdown
export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: 'UTC-9' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)', offset: 'UTC-10' },
  { value: 'America/Phoenix', label: 'Arizona (No DST)', offset: 'UTC-7' },
  { value: 'America/Puerto_Rico', label: 'Atlantic Time (AT)', offset: 'UTC-4' },
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'Central European (CET)', offset: 'UTC+1' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: 'UTC+1' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: 'UTC+3' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 'UTC+4' },
  { value: 'Asia/Kolkata', label: 'India (IST)', offset: 'UTC+5:30' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', offset: 'UTC+7' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)', offset: 'UTC+10' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST)', offset: 'UTC+12' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 'UTC+0' },
] as const;

// Get user's local timezone
export function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// Find matching timezone from our list or return default
export function getDefaultTimezone(): string {
  const localTz = getLocalTimezone();
  const match = TIMEZONES.find(tz => tz.value === localTz);
  return match ? match.value : 'America/New_York';
}

function formatDateForICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function formatDateForGoogle(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Escape special characters for ICS text fields
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function generateICSContent(event: EventData): string {
  const start = formatDateForICS(event.startTime);
  const end = event.endTime ? formatDateForICS(event.endTime) : formatDateForICS(new Date(event.startTime.getTime() + 60 * 60 * 1000));
  const dtstamp = formatDateForICS(new Date());
  const uid = `${event.id || Date.now()}@caldrop.com`;
  
  // Build VALARM entries for each reminder
  // Default to 1 hour and 1 day before if no reminders specified
  const reminders = event.reminderMinutes && event.reminderMinutes.length > 0 
    ? event.reminderMinutes 
    : [60, 1440];
  
  const alarms = reminders.map(minutes => {
    // Convert minutes to proper ISO 8601 duration
    let trigger: string;
    if (minutes === 0) {
      trigger = 'PT0M';
    } else if (minutes >= 1440 && minutes % 1440 === 0) {
      // Use days for full day values
      trigger = `-P${minutes / 1440}D`;
    } else if (minutes >= 60 && minutes % 60 === 0) {
      // Use hours for full hour values
      trigger = `-PT${minutes / 60}H`;
    } else {
      trigger = `-PT${minutes}M`;
    }
    
    return `BEGIN:VALARM
TRIGGER:${trigger}
ACTION:DISPLAY
DESCRIPTION:Reminder: ${escapeICSText(event.title)}
END:VALARM`;
  }).join('\n');

  const description = event.description ? escapeICSText(event.description) : '';
  const location = event.location ? escapeICSText(event.location) : '';
  const summary = escapeICSText(event.title);

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CalDrop//Event//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:CalDrop Event
BEGIN:VEVENT
DTSTAMP:${dtstamp}
UID:${uid}
DTSTART:${start}
DTEND:${end}
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:${location}
STATUS:CONFIRMED
TRANSP:OPAQUE
${alarms}
END:VEVENT
END:VCALENDAR`.trim();
}

export function downloadICS(event: EventData): void {
  const content = generateICSContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateGoogleCalendarURL(event: EventData): string {
  const start = formatDateForGoogle(event.startTime);
  const end = event.endTime 
    ? formatDateForGoogle(event.endTime) 
    : formatDateForGoogle(new Date(event.startTime.getTime() + 60 * 60 * 1000));
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description || '',
    location: event.location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateOutlookURL(event: EventData): string {
  const start = event.startTime.toISOString();
  const end = event.endTime 
    ? event.endTime.toISOString() 
    : new Date(event.startTime.getTime() + 60 * 60 * 1000).toISOString();
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: start,
    enddt: end,
    body: event.description || '',
    location: event.location || '',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) + '-' + Math.random().toString(36).substring(2, 8);
}
