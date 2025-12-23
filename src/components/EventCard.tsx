import { Calendar, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { EventData, generateGoogleCalendarURL, generateOutlookURL, downloadICS } from "@/lib/calendar";

interface EventCardProps {
  event: EventData;
  onAddToCalendar?: (calendarType: string) => void;
}

export function EventCard({ event, onAddToCalendar }: EventCardProps) {
  const handleGoogleCalendar = () => {
    window.open(generateGoogleCalendarURL(event), '_blank');
    onAddToCalendar?.('google');
  };

  const handleOutlook = () => {
    window.open(generateOutlookURL(event), '_blank');
    onAddToCalendar?.('outlook');
  };

  const handleApple = () => {
    downloadICS(event);
    onAddToCalendar?.('apple');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-2xl border border-border p-6 space-y-6 animate-scale-in">
        {/* Event Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            {event.title}
          </h1>
          {event.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        {/* Event Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-foreground">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{format(event.startTime, 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-sm text-muted-foreground">
                {format(event.startTime, 'h:mm a')}
                {event.endTime && ` - ${format(event.endTime, 'h:mm a')}`}
              </p>
            </div>
          </div>

          {event.location && (
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{event.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Calendar Buttons */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground text-center">
            Add to your calendar
          </p>
          <div className="space-y-2">
            <Button
              variant="calendar"
              size="lg"
              className="w-full justify-start gap-3"
              onClick={handleGoogleCalendar}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="#4285F4"/>
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2" fill="#34A853"/>
                <path d="M2 12c0 5.523 4.477 10 10 10" fill="#FBBC05"/>
                <path d="M2 12C2 6.477 6.477 2 12 2" fill="#EA4335"/>
                <path d="M12 7v5l4.25 2.53" stroke="#fff" strokeWidth="1.5" fill="none"/>
              </svg>
              Google Calendar
            </Button>
            <Button
              variant="calendar"
              size="lg"
              className="w-full justify-start gap-3"
              onClick={handleApple}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple Calendar
            </Button>
            <Button
              variant="calendar"
              size="lg"
              className="w-full justify-start gap-3"
              onClick={handleOutlook}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V12zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z" fill="#0078D4"/>
              </svg>
              Outlook Calendar
            </Button>
          </div>
        </div>
      </div>

      {/* Branding */}
      <p className="text-center text-xs text-muted-foreground mt-6">
        Powered by <span className="text-gradient font-semibold">CalDrop</span>
      </p>
    </div>
  );
}
