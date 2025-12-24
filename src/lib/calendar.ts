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
}

function formatDateForICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function formatDateForGoogle(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function generateICSContent(event: EventData): string {
  const start = formatDateForICS(event.startTime);
  const end = event.endTime ? formatDateForICS(event.endTime) : formatDateForICS(new Date(event.startTime.getTime() + 60 * 60 * 1000));
  
  let alarms = '';
  if (event.reminderMinutes && event.reminderMinutes.length > 0) {
    alarms = event.reminderMinutes.map(minutes => `
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Reminder
TRIGGER:-PT${minutes}M
END:VALARM`).join('');
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CalDrop//Event//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
UID:${event.id || Date.now()}@caldrop.app${alarms}
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
