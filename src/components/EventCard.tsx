import { useState } from "react";
import { Calendar, ExternalLink, CalendarPlus, ChevronDown, Check, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EventData, defaultUISchema, downloadICS, generateGoogleCalendarURL, generateOutlookURL, TIMEZONES, CATEGORY_LABELS, EventCategory } from "@/lib/calendar";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: EventData;
  onAddToCalendar?: (calendarType: string) => void;
  onRsvp?: (name: string, email: string) => Promise<void>;
  rsvpCount?: number;
  isPreview?: boolean;
}

export function EventCard({ event, onAddToCalendar, onRsvp, rsvpCount, isPreview }: EventCardProps) {
  const uiSchema = event.uiSchema || defaultUISchema;
  const pageType = event.pageType || 'calendar';

  // Get timezone label for display
  const timezoneLabel = event.timezone
    ? TIMEZONES.find(tz => tz.value === event.timezone)?.label || event.timezone
    : null;

  const handleDownloadICS = () => {
    downloadICS(event);
    onAddToCalendar?.('ics');
  };

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarURL(event);
    window.open(url, '_blank');
    onAddToCalendar?.('google');
  };

  const handleOutlookCalendar = () => {
    const url = generateOutlookURL(event);
    window.open(url, '_blank');
    onAddToCalendar?.('outlook');
  };

  // Image size classes
  const imageSizeClasses = {
    small: 'max-h-32',
    medium: 'max-h-48',
    large: 'max-h-64',
    full: 'max-h-80',
  };

  // Text alignment classes
  const textAlignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-2xl border border-border overflow-hidden animate-scale-in">
        {/* Event Image */}
        {event.imageUrl && (
          <div className={cn(
            "w-full overflow-hidden bg-secondary/50",
            imageSizeClasses[uiSchema.imageSize]
          )}>
            <img
              src={event.imageUrl}
              alt={event.title}
              className={cn(
                "w-full h-auto object-contain",
                imageSizeClasses[uiSchema.imageSize]
              )}
            />
          </div>
        )}

        <div className={cn("p-6 space-y-6", textAlignClasses[uiSchema.textAlign])}>
          {/* Category Badge + Event Title */}
          <div className="space-y-2">
            {event.category && event.category !== 'other' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {CATEGORY_LABELS[event.category as EventCategory] || event.category}
              </span>
            )}
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {event.title}
            </h1>
            {uiSchema.showDescription && event.description && (
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            )}
          </div>

          {/* Event Details */}
          <div className={cn(
            "space-y-3",
            uiSchema.textAlign === 'center' && "flex flex-col items-center"
          )}>
            {/* Date/Time - stacked layout for center alignment */}
            {uiSchema.textAlign === 'center' ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">{format(event.startTime, 'EEEE, MMMM d, yyyy')}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(event.startTime, 'h:mm a')}
                    {event.endTime && ` - ${format(event.endTime, 'h:mm a')}`}
                    {timezoneLabel && (
                      <span className="ml-1 text-xs opacity-70">({timezoneLabel.split(' ')[0]})</span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className={cn(
                "flex items-center gap-3 text-foreground",
                uiSchema.textAlign === 'right' && "justify-end"
              )}>
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className={textAlignClasses[uiSchema.textAlign]}>
                  <p className="font-medium">{format(event.startTime, 'EEEE, MMMM d, yyyy')}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(event.startTime, 'h:mm a')}
                    {event.endTime && ` - ${format(event.endTime, 'h:mm a')}`}
                    {timezoneLabel && (
                      <span className="ml-1 text-xs opacity-70">({timezoneLabel.split(' ')[0]})</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Location link - stacked layout for center alignment */}
            {event.location && (
              uiSchema.textAlign === 'center' ? (
                <a
                  href={event.location.startsWith('http') ? event.location : `https://${event.location}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-primary">
                      {(() => {
                        try {
                          return new URL(event.location.startsWith('http') ? event.location : `https://${event.location}`).hostname;
                        } catch {
                          return event.location;
                        }
                      })()}
                    </p>
                    <p className="text-sm text-muted-foreground">Event link</p>
                  </div>
                </a>
              ) : (
                <a
                  href={event.location.startsWith('http') ? event.location : `https://${event.location}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-3 text-foreground hover:opacity-80 transition-opacity",
                    uiSchema.textAlign === 'right' && "justify-end"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-5 h-5 text-primary" />
                  </div>
                  <div className={cn("flex-1 min-w-0", textAlignClasses[uiSchema.textAlign])}>
                    <p className="font-medium text-primary truncate">
                      {(() => {
                        try {
                          return new URL(event.location.startsWith('http') ? event.location : `https://${event.location}`).hostname;
                        } catch {
                          return event.location;
                        }
                      })()}
                    </p>
                    <p className="text-sm text-muted-foreground">Event link</p>
                  </div>
                </a>
              )
            )}

            {/* URL link - stacked layout for center alignment */}
            {event.url && (
              uiSchema.textAlign === 'center' ? (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-primary truncate">{new URL(event.url).hostname}</p>
                    <p className="text-sm text-muted-foreground">Event link</p>
                  </div>
                </a>
              ) : (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-3 text-foreground hover:opacity-80 transition-opacity",
                    uiSchema.textAlign === 'right' && "justify-end"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-5 h-5 text-primary" />
                  </div>
                  <div className={cn("flex-1 min-w-0", textAlignClasses[uiSchema.textAlign])}>
                    <p className="font-medium text-primary truncate">{new URL(event.url).hostname}</p>
                    <p className="text-sm text-muted-foreground">Event link</p>
                  </div>
                </a>
              )
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* CTA Section — Calendar or RSVP */}
          {pageType === 'calendar' ? (
            <CalendarCTA
              uiSchema={uiSchema}
              onGoogle={handleGoogleCalendar}
              onOutlook={handleOutlookCalendar}
              onApple={handleDownloadICS}
            />
          ) : (
            <RsvpCTA
              uiSchema={uiSchema}
              pageType={pageType}
              capacity={event.capacity}
              rsvpCount={rsvpCount}
              onRsvp={onRsvp}
              isPreview={isPreview}
            />
          )}
        </div>
      </div>

      {/* Branding */}
      <p className="text-center text-xs text-muted-foreground mt-6">
        Powered by <span className="text-gradient font-semibold">CalDrop</span>
      </p>
    </div>
  );
}

/* ─── Calendar CTA ─── */

function CalendarCTA({
  uiSchema,
  onGoogle,
  onOutlook,
  onApple,
}: {
  uiSchema: NonNullable<EventData['uiSchema']>;
  onGoogle: () => void;
  onOutlook: () => void;
  onApple: () => void;
}) {
  return (
    <div className="space-y-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={uiSchema.buttonStyle === 'minimal' ? 'outline' : 'glow'}
            size="lg"
            className={cn(
              "w-full",
              uiSchema.buttonStyle === 'rounded' && "rounded-full",
              uiSchema.buttonStyle === 'minimal' && "border-primary text-primary hover:bg-primary/10"
            )}
          >
            <CalendarPlus className="w-5 h-5" />
            Add to Calendar
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-56">
          <DropdownMenuItem onClick={onGoogle} className="cursor-pointer">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/2048px-Google_Calendar_icon_%282020%29.svg.png"
              alt="Google Calendar"
              className="w-4 h-4 mr-2 object-contain"
            />
            Google Calendar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onOutlook} className="cursor-pointer">
            <img
              src="https://cdn.prod.website-files.com/5f196ad93510ee0712a58d15/6346f24b925ee304ff41965c_Outlook.com_icon_(2012-2019).svg.png"
              alt="Outlook Calendar"
              className="w-4 h-4 mr-2 object-contain"
            />
            Outlook Calendar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onApple} className="cursor-pointer">
            <img
              src="https://cdn.jim-nielsen.com/macos/512/calendar-2021-04-29.png?rf=1024"
              alt="Apple Calendar"
              className="w-4 h-4 mr-2 object-contain"
            />
            Apple Calendar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="text-xs text-muted-foreground text-center">
        Works with Google, Apple, Outlook & more
      </p>
    </div>
  );
}

/* ─── RSVP CTA ─── */

function RsvpCTA({
  uiSchema,
  pageType,
  capacity,
  rsvpCount = 0,
  onRsvp,
  isPreview,
}: {
  uiSchema: NonNullable<EventData['uiSchema']>;
  pageType: 'rsvp' | 'waitlist';
  capacity?: number;
  rsvpCount?: number;
  onRsvp?: (name: string, email: string) => Promise<void>;
  isPreview?: boolean;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFull = pageType === 'waitlist' && capacity != null && rsvpCount >= capacity;
  const spotsLeft = pageType === 'waitlist' && capacity != null ? capacity - rsvpCount : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || isPreview) return;

    setError(null);
    setSubmitting(true);
    try {
      await onRsvp?.(name.trim(), email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-3 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Check className="w-7 h-7 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">
            {isFull ? "You're on the waitlist!" : "You're in!"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {isFull
              ? "We'll notify you if a spot opens up."
              : "We'll see you there."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Spots indicator for waitlist */}
      {pageType === 'waitlist' && spotsLeft != null && (
        <div className="text-center">
          {isFull ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
              Event is full
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-background border-border"
        />
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-background border-border"
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button
          type="submit"
          variant={uiSchema.buttonStyle === 'minimal' ? 'outline' : 'glow'}
          size="lg"
          className={cn(
            "w-full",
            uiSchema.buttonStyle === 'rounded' && "rounded-full",
            uiSchema.buttonStyle === 'minimal' && "border-primary text-primary hover:bg-primary/10"
          )}
          disabled={submitting || isPreview}
        >
          <UserPlus className="w-5 h-5" />
          {submitting ? 'Submitting...' : isFull ? 'Join Waitlist' : 'RSVP'}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground text-center">
        {isFull ? "You'll be notified if a spot opens up" : "We'll save your spot"}
      </p>
    </div>
  );
}
