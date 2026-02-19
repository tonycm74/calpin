import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  ExternalLink,
  Pencil,
  Trash2,
  MapPin,
  Clock,
} from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  format,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { EventPage } from '@/hooks/useEventPages';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface EventCalendarProps {
  eventPages: EventPage[] | undefined;
  isLoading: boolean;
  onCreateEvent: (date?: Date) => void;
  onEditEvent: (page: EventPage) => void;
  onDeleteEvent: (id: string) => void;
  onCopyLink: (slug: string) => void;
}

export function EventCalendar({
  eventPages,
  isLoading,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onCopyLink,
}: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Build a map of date string -> events for quick lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventPage[]>();
    if (!eventPages) return map;
    for (const page of eventPages) {
      const dateKey = format(new Date(page.start_time), 'yyyy-MM-dd');
      const existing = map.get(dateKey) || [];
      existing.push(page);
      map.set(dateKey, existing);
    }
    return map;
  }, [eventPages]);

  // Generate all days to display in the calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const handleNextMonth = () => setCurrentMonth((m) => addMonths(m, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const handleDateClick = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const events = eventsByDate.get(dateKey);
    // If no events on this date, prompt to create
    if (!events || events.length === 0) {
      setSelectedDate(day);
      setCreateDialogOpen(true);
    }
  };

  const handleConfirmCreate = () => {
    setCreateDialogOpen(false);
    onCreateEvent(selectedDate || undefined);
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="h-7 w-40 bg-secondary rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-secondary rounded" />
            <div className="h-8 w-8 bg-secondary rounded" />
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square bg-secondary/50 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-up">
        {/* Calendar Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-foreground">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="sm" onClick={handleToday} className="text-xs">
              Today
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate.get(dateKey) || [];
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(day)}
                className={`
                  min-h-[110px] sm:min-h-[140px] border-b border-r border-border p-1.5 sm:p-2 cursor-pointer
                  transition-colors hover:bg-accent/50
                  ${!inMonth ? 'bg-muted/30' : ''}
                  ${idx % 7 === 0 ? 'border-l-0' : ''}
                `}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`
                      inline-flex items-center justify-center text-sm w-7 h-7 rounded-full
                      ${today ? 'bg-primary text-primary-foreground font-bold' : ''}
                      ${!inMonth ? 'text-muted-foreground/50' : 'text-foreground'}
                    `}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Event Pills */}
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <EventPill
                      key={event.id}
                      event={event}
                      onEdit={onEditEvent}
                      onDelete={onDeleteEvent}
                      onCopyLink={onCopyLink}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-muted-foreground pl-1">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create an Event</DialogTitle>
            <DialogDescription>
              {selectedDate && (
                <>Would you like to create an event on{' '}
                  <span className="font-medium text-foreground">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </span>?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" onClick={handleConfirmCreate}>
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── Event Pill with Popover ─── */

function EventPill({
  event,
  onEdit,
  onDelete,
  onCopyLink,
}: {
  event: EventPage;
  onEdit: (page: EventPage) => void;
  onDelete: (id: string) => void;
  onCopyLink: (slug: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="w-full text-left text-[11px] sm:text-xs leading-tight px-1.5 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors truncate block font-medium"
        >
          {event.title}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 space-y-3">
          {/* Event Info */}
          <div>
            <h4 className="font-semibold text-sm text-foreground">{event.title}</h4>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {format(new Date(event.start_time), 'MMM d, yyyy · h:mm a')}
            </div>
            {event.location && (
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {event.location}
              </div>
            )}
            {event.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => onCopyLink(event.slug)}
            >
              <Copy className="w-3 h-3" />
              Copy Link
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(event)}
            >
              <Pencil className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <Link to={`/e/${event.slug}`} target="_blank">
                <ExternalLink className="w-3 h-3" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDelete(event.id)}
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
