import { Calendar, ExternalLink, CalendarPlus, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EventData, defaultUISchema, downloadICS, generateGoogleCalendarURL, generateOutlookURL, TIMEZONES } from "@/lib/calendar";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: EventData;
  onAddToCalendar?: (calendarType: string) => void;
}

export function EventCard({ event, onAddToCalendar }: EventCardProps) {
  const uiSchema = event.uiSchema || defaultUISchema;
  
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
          {/* Event Title */}
          <div className="space-y-2">
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

          {/* Calendar Buttons */}
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
                <DropdownMenuItem onClick={handleGoogleCalendar} className="cursor-pointer">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/2048px-Google_Calendar_icon_%282020%29.svg.png" 
                    alt="Google Calendar" 
                    className="w-4 h-4 mr-2 object-contain"
                  />
                  Google Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOutlookCalendar} className="cursor-pointer">
                  <img 
                    src="https://cdn.prod.website-files.com/5f196ad93510ee0712a58d15/6346f24b925ee304ff41965c_Outlook.com_icon_(2012-2019).svg.png" 
                    alt="Outlook Calendar" 
                    className="w-4 h-4 mr-2 object-contain"
                  />
                  Outlook Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadICS} className="cursor-pointer">
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
        </div>
      </div>

      {/* Branding */}
      <p className="text-center text-xs text-muted-foreground mt-6">
        Powered by <span className="text-gradient font-semibold">CalPing</span>
      </p>
    </div>
  );
}
