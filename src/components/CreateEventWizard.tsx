import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, getDay, getDate } from "date-fns";
import {
  Calendar as CalendarIcon,
  CalendarPlus,
  FileText,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Palette,
  Check,
  Clock,
  Globe,
  Sparkles,
  Wand2,
  Loader2,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Users,
  LayoutGrid,
  Repeat,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ImageUpload";
import { EventCard } from "@/components/EventCard";
import { TimePicker } from "@/components/TimePicker";
import { EventData, UISchema, defaultUISchema, generateSlug, TIMEZONES, getDefaultTimezone, PageType, EVENT_CATEGORIES, CATEGORY_LABELS, EventCategory } from "@/lib/calendar";
import { RecurrenceRule, DAY_LABELS, describeRecurrence } from "@/lib/recurrence";
import { useCreateEventPage, useUpdateEventPage, useCreateRecurringEvent } from "@/hooks/useEventPages";
import { useEventImport, ImportedEventInfo } from "@/hooks/useEventImport";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const eventSchema = z.object({
  title: z.string().min(1, "Event title is required").max(100),
  description: z.string().max(500).optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  startTime: z.string().min(1, "Start time is required"),
  endDate: z.date().optional().nullable(),
  endTime: z.string().optional(),
  location: z.string().max(200).optional(),
  timezone: z.string().min(1, "Timezone is required"),
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventWizardProps {
  onEventCreated: (event?: EventData) => void;
  existingEvent?: EventData;
  mode?: 'create' | 'edit';
  onCancel?: () => void;
}

// Helper to match timezone from string, with optional venue/location fallback
function matchTimezone(tz: string | null, venue?: string | null, location?: string | null): string {
  const abbrevMap: Record<string, string> = {
    'est': 'America/New_York',
    'edt': 'America/New_York',
    'cst': 'America/Chicago',
    'cdt': 'America/Chicago',
    'mst': 'America/Denver',
    'mdt': 'America/Denver',
    'pst': 'America/Los_Angeles',
    'pdt': 'America/Los_Angeles',
    'et': 'America/New_York',
    'ct': 'America/Chicago',
    'mt': 'America/Denver',
    'pt': 'America/Los_Angeles',
    'eastern': 'America/New_York',
    'central': 'America/Chicago',
    'mountain': 'America/Denver',
    'pacific': 'America/Los_Angeles',
    'gmt': 'Europe/London',
    'utc': 'UTC',
    'america/new_york': 'America/New_York',
    'america/chicago': 'America/Chicago',
    'america/denver': 'America/Denver',
    'america/los_angeles': 'America/Los_Angeles',
    'europe/london': 'Europe/London',
    'europe/berlin': 'Europe/Berlin',
    'asia/tokyo': 'Asia/Tokyo',
  };
  
  const cityMap: Record<string, string> = {
    'new york': 'America/New_York',
    'nyc': 'America/New_York',
    'manhattan': 'America/New_York',
    'brooklyn': 'America/New_York',
    'madison square garden': 'America/New_York',
    'msg': 'America/New_York',
    'boston': 'America/New_York',
    'philadelphia': 'America/New_York',
    'miami': 'America/New_York',
    'atlanta': 'America/New_York',
    'washington': 'America/New_York',
    'chicago': 'America/Chicago',
    'dallas': 'America/Chicago',
    'houston': 'America/Chicago',
    'san antonio': 'America/Chicago',
    'denver': 'America/Denver',
    'phoenix': 'America/Denver',
    'salt lake': 'America/Denver',
    'los angeles': 'America/Los_Angeles',
    'la': 'America/Los_Angeles',
    'san francisco': 'America/Los_Angeles',
    'seattle': 'America/Los_Angeles',
    'portland': 'America/Los_Angeles',
    'las vegas': 'America/Los_Angeles',
    'san diego': 'America/Los_Angeles',
    'sacramento': 'America/Los_Angeles',
    'oakland': 'America/Los_Angeles',
    'london': 'Europe/London',
    'tokyo': 'Asia/Tokyo',
  };

  if (tz) {
    const lower = tz.toLowerCase().trim();
    if (abbrevMap[lower]) return abbrevMap[lower];
    
    const exactMatch = TIMEZONES.find(t => 
      t.value.toLowerCase() === lower ||
      t.label.toLowerCase().includes(lower)
    );
    if (exactMatch) return exactMatch.value;
  }
  
  const searchText = `${venue || ''} ${location || ''}`.toLowerCase();
  for (const [city, timezone] of Object.entries(cityMap)) {
    if (searchText.includes(city)) {
      return timezone;
    }
  }
  
  return getDefaultTimezone();
}

// Card wrapper component
function WizardCard({ 
  icon: Icon, 
  title, 
  children,
  collapsible = false,
  defaultOpen = true,
}: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 p-4 text-left",
          collapsible && "hover:bg-secondary/50 transition-colors cursor-pointer",
          !collapsible && "cursor-default"
        )}
        disabled={!collapsible}
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="font-semibold text-foreground flex-1">{title}</span>
        {collapsible && (
          isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}

function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function CreateEventWizard({ onEventCreated, existingEvent, mode = 'create', onCancel }: CreateEventWizardProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(existingEvent?.imageUrl);
  const [uiSchema, setUISchema] = useState<UISchema>(existingEvent?.uiSchema || defaultUISchema);
  const [pageType, setPageType] = useState<PageType>(existingEvent?.pageType || 'calendar');
  const [capacity, setCapacity] = useState<number | undefined>(existingEvent?.capacity);
  const [category, setCategory] = useState<string>(existingEvent?.category || 'other');
  const [showImport, setShowImport] = useState(mode === 'create' && !existingEvent);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>({
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: [],
    endType: 'after',
    endAfterCount: 4,
  });

  // Import state
  const [importUrl, setImportUrl] = useState("");
  const [importedData, setImportedData] = useState<ImportedEventInfo | null>(null);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const { extractEventInfo, isLoading: isImporting, error: importError, clearError } = useEventImport();

  const createEvent = useCreateEventPage();
  const updateEvent = useUpdateEventPage();
  const createRecurring = useCreateRecurringEvent();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: existingEvent?.title || "",
      description: existingEvent?.description || "",
      startDate: existingEvent?.startTime || undefined,
      startTime: existingEvent?.startTime 
        ? `${existingEvent.startTime.getHours().toString().padStart(2, '0')}:${existingEvent.startTime.getMinutes().toString().padStart(2, '0')}`
        : "",
      endDate: existingEvent?.endTime || undefined,
      endTime: existingEvent?.endTime
        ? `${existingEvent.endTime.getHours().toString().padStart(2, '0')}:${existingEvent.endTime.getMinutes().toString().padStart(2, '0')}`
        : "",
      location: existingEvent?.location || "",
      timezone: existingEvent?.timezone || getDefaultTimezone(),
    },
  });

  const watchedValues = watch();

  // Handle import
  const handleImport = async () => {
    if (!importUrl.trim()) return;
    
    clearError();
    const result = await extractEventInfo(importUrl.trim());
    
    if (result) {
      const { data, images } = result;
      setImportedData(data);
      setAvailableImages(images);
      
      if (data.title) setValue('title', data.title);
      if (data.description) setValue('description', data.description);
      if (data.date) {
        const parsedDate = new Date(data.date);
        if (!isNaN(parsedDate.getTime())) {
          setValue('startDate', parsedDate);
        }
      }
      if (data.time) {
        let timeStr = data.time;
        if (timeStr.includes(':')) {
          setValue('startTime', timeStr.substring(0, 5));
        }
      }
      setValue('timezone', matchTimezone(data.timezone, data.venue, data.location));
      
      if (data.ticket_url || data.location) {
        setValue('location', data.ticket_url || data.location || '');
      }
      
      if (data.image_url) {
        setImageUrl(data.image_url);
      } else if (images.length > 0) {
        setImageUrl(images[0]);
      }
      
      setShowImport(false);
    }
  };

  // Generate preview event data
  const previewEvent = useMemo((): EventData | null => {
    const { title, startDate, startTime, endDate, endTime, description, location, timezone } = watchedValues;
    
    if (!title && !startDate && !startTime && !imageUrl) {
      return null;
    }

    let startDateTime: Date;
    try {
      if (startDate && startTime) {
        const [hours, minutes] = startTime.split(':').map(Number);
        startDateTime = new Date(startDate);
        startDateTime.setHours(hours, minutes);
      } else if (startDate) {
        startDateTime = new Date(startDate);
        startDateTime.setHours(12, 0);
      } else {
        startDateTime = new Date();
      }
    } catch {
      startDateTime = new Date();
    }

    let endDateTime: Date | undefined;
    if (endDate && endTime) {
      try {
        const [hours, minutes] = endTime.split(':').map(Number);
        endDateTime = new Date(endDate);
        endDateTime.setHours(hours, minutes);
      } catch {
        endDateTime = undefined;
      }
    }

    return {
      id: existingEvent?.id || "preview",
      title: title || "Your Event Title",
      description: description || undefined,
      startTime: startDateTime,
      endTime: endDateTime,
      location: location || undefined,
      url: undefined,
      imageUrl: imageUrl,
      slug: existingEvent?.slug || generateSlug(title || "preview"),
      reminderMinutes: existingEvent?.reminderMinutes || [],
      uiSchema: uiSchema,
      timezone: timezone,
      pageType: pageType,
      capacity: capacity,
      category: category,
    };
  }, [watchedValues, imageUrl, uiSchema, existingEvent, pageType, capacity, category]);

  const onSubmit = async (data: EventFormData) => {
    const [startHours, startMinutes] = data.startTime.split(':').map(Number);
    const startDateTime = new Date(data.startDate);
    startDateTime.setHours(startHours, startMinutes);
    
    let endDateTime: Date | undefined;
    if (data.endDate && data.endTime) {
      const [endHours, endMinutes] = data.endTime.split(':').map(Number);
      endDateTime = new Date(data.endDate);
      endDateTime.setHours(endHours, endMinutes);
    }

    const event: EventData = {
      id: existingEvent?.id || crypto.randomUUID(),
      title: data.title,
      description: data.description,
      startTime: startDateTime,
      endTime: endDateTime,
      location: data.location || undefined,
      url: undefined,
      imageUrl: imageUrl,
      slug: existingEvent?.slug || generateSlug(data.title),
      reminderMinutes: existingEvent?.reminderMinutes || [],
      uiSchema: uiSchema,
      timezone: data.timezone,
      pageType: pageType,
      capacity: pageType === 'waitlist' ? capacity : undefined,
      category: category,
    };

    if (user) {
      if (mode === 'edit' && existingEvent?.id) {
        await updateEvent.mutateAsync({ ...event, id: existingEvent.id });
      } else if (isRecurring) {
        await createRecurring.mutateAsync({ ...event, recurrenceRule });
      } else {
        await createEvent.mutateAsync(event);
      }
      onEventCreated();
    } else {
      onEventCreated(event);
    }
  };

  const updateUISchema = (key: keyof UISchema, value: UISchema[keyof UISchema]) => {
    setUISchema(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Form Column - Stacked Cards */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Import Card */}
        {showImport && (
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Import from link</h3>
                <p className="text-sm text-muted-foreground">Paste any event URL to auto-fill details</p>
              </div>
            </div>

            {/* Platform suggestions */}
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Ticketmaster', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                { name: 'Eventbrite', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
                { name: 'Tixr', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                { name: 'Zoom', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
                { name: 'Meetup', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
              ].map((platform) => (
                <span
                  key={platform.name}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-full border",
                    platform.color
                  )}
                >
                  {platform.name}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Paste event URL..."
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                className="bg-card border-border focus:border-primary flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleImport();
                  }
                }}
              />
              <Button
                type="button"
                variant="glow"
                onClick={handleImport}
                disabled={isImporting || !importUrl.trim()}
              >
                {isImporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </Button>
            </div>

            {importError && (
              <p className="text-sm text-destructive">{importError}</p>
            )}

            {importedData && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Check className="w-4 h-4" />
                <span>Imported: {importedData.title}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowImport(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip and create manually →
            </button>
          </div>
        )}

        {/* Page Type Card */}
        <WizardCard icon={LayoutGrid} title="Page Type">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'calendar' as PageType, icon: CalendarPlus, label: 'Calendar', desc: 'Add to calendar CTA' },
                { value: 'rsvp' as PageType, icon: UserPlus, label: 'RSVP', desc: 'Collect name & email' },
                { value: 'waitlist' as PageType, icon: Users, label: 'Waitlist', desc: 'RSVP with capacity' },
              ]).map(({ value, icon: Icon, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPageType(value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                    pageType === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 bg-background"
                  )}
                >
                  <Icon className={cn("w-6 h-6", pageType === value ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-medium", pageType === value ? "text-foreground" : "text-muted-foreground")}>{label}</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">{desc}</span>
                </button>
              ))}
            </div>
            {pageType === 'waitlist' && (
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  placeholder="e.g., 100"
                  value={capacity || ''}
                  onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-background border-border focus:border-primary max-w-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  Once full, new signups are added to the waitlist
                </p>
              </div>
            )}
          </div>
        </WizardCard>

        {/* Category Card */}
        <WizardCard icon={Tag} title="Event Category">
          <div className="flex flex-wrap gap-2">
            {EVENT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                  category === cat
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50"
                )}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </WizardCard>

        {/* Basics Card */}
        <WizardCard icon={FileText} title="Event Details">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Name *</Label>
              <Input
                id="title"
                placeholder="e.g., Summer Music Festival 2025"
                {...register("title")}
                className="bg-background border-border focus:border-primary"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell people what to expect..."
                rows={3}
                {...register("description")}
                className="bg-background border-border focus:border-primary resize-none"
              />
            </div>
          </div>
        </WizardCard>

        {/* Date & Time Card */}
        <WizardCard icon={Clock} title="Date & Time">
          <div className="space-y-4">
            {/* Timezone */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                Timezone
              </Label>
              <Controller
                control={control}
                name="timezone"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border max-h-64">
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          <span className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xs font-mono">{tz.offset}</span>
                            <span>{tz.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Start Date & Time */}
            <div className="space-y-2">
              <Label>Start *</Label>
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background border-border",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "MMM d, yyyy") : "Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            if (date && isRecurring) {
                              setRecurrenceRule((r) => ({
                                ...r,
                                daysOfWeek: [getDay(date)],
                                dayOfMonth: getDate(date),
                              }));
                            }
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <Controller
                  control={control}
                  name="startTime"
                  render={({ field }) => (
                    <TimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Time"
                    />
                  )}
                />
              </div>
              {(errors.startDate || errors.startTime) && (
                <p className="text-sm text-destructive">
                  {errors.startDate?.message || errors.startTime?.message}
                </p>
              )}
            </div>

            {/* End Date & Time */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">End (optional)</Label>
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background border-border",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "MMM d, yyyy") : "Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <Controller
                  control={control}
                  name="endTime"
                  render={({ field }) => (
                    <TimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Time"
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </WizardCard>

        {/* Repeat Card */}
        {mode === 'create' && (
          <WizardCard icon={Repeat} title="Repeat" collapsible defaultOpen={false}>
            <div className="space-y-4">
              {/* Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isRecurring}
                  onClick={() => {
                    const next = !isRecurring;
                    setIsRecurring(next);
                    if (next && watchedValues.startDate) {
                      const dow = getDay(watchedValues.startDate);
                      const dom = getDate(watchedValues.startDate);
                      setRecurrenceRule((r) => ({
                        ...r,
                        daysOfWeek: [dow],
                        dayOfMonth: dom,
                      }));
                    }
                  }}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    isRecurring ? "bg-primary" : "bg-secondary"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                      isRecurring ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
                <span className="text-sm font-medium text-foreground">Repeat this event</span>
              </label>

              {isRecurring && (
                <div className="space-y-4 pt-1">
                  {/* Frequency */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={recurrenceRule.frequency}
                        onValueChange={(v) => setRecurrenceRule((r) => ({ ...r, frequency: v as RecurrenceRule['frequency'] }))}
                      >
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Every</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={30}
                          value={recurrenceRule.interval}
                          onChange={(e) => setRecurrenceRule((r) => ({ ...r, interval: Math.max(1, Number(e.target.value) || 1) }))}
                          className="bg-background border-border w-20"
                        />
                        <span className="text-sm text-muted-foreground">
                          {recurrenceRule.frequency === 'daily' ? 'day(s)' : recurrenceRule.frequency === 'weekly' ? 'week(s)' : 'month(s)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Days of week (weekly) — auto-set from start date, user can add more */}
                  {recurrenceRule.frequency === 'weekly' && (
                    <div className="space-y-2">
                      <Label>On days</Label>
                      <div className="flex gap-1.5">
                        {DAY_LABELS.map((label, i) => {
                          const isStartDay = watchedValues.startDate && getDay(watchedValues.startDate) === i;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                // Don't allow deselecting the start date's day
                                if (isStartDay) return;
                                setRecurrenceRule((r) => {
                                  const days = r.daysOfWeek || [];
                                  return {
                                    ...r,
                                    daysOfWeek: days.includes(i) ? days.filter((d) => d !== i) : [...days, i],
                                  };
                                });
                              }}
                              className={cn(
                                "w-10 h-10 rounded-lg text-xs font-medium transition-colors",
                                recurrenceRule.daysOfWeek?.includes(i)
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                              )}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      {watchedValues.startDate && (
                        <p className="text-xs text-muted-foreground">
                          {DAY_LABELS[getDay(watchedValues.startDate)]} is auto-selected from your start date
                        </p>
                      )}
                    </div>
                  )}

                  {/* Day of month (monthly) — auto-set from start date */}
                  {recurrenceRule.frequency === 'monthly' && (
                    <div className="space-y-2">
                      <Label>On day</Label>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={recurrenceRule.dayOfMonth || ''}
                        onChange={(e) => setRecurrenceRule((r) => ({ ...r, dayOfMonth: Number(e.target.value) || undefined }))}
                        className="bg-background border-border w-24"
                      />
                      {watchedValues.startDate && (
                        <p className="text-xs text-muted-foreground">
                          Auto-set to the {ordinalSuffix(getDate(watchedValues.startDate))} from your start date
                        </p>
                      )}
                    </div>
                  )}

                  {/* End condition */}
                  <div className="space-y-3">
                    <Label>Ends</Label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="endType"
                          checked={recurrenceRule.endType === 'after'}
                          onChange={() => setRecurrenceRule((r) => ({ ...r, endType: 'after' }))}
                          className="accent-primary"
                        />
                        <span className="text-sm">After</span>
                        <Input
                          type="number"
                          min={1}
                          max={52}
                          value={recurrenceRule.endAfterCount || ''}
                          onChange={(e) => setRecurrenceRule((r) => ({ ...r, endAfterCount: Number(e.target.value) || undefined }))}
                          disabled={recurrenceRule.endType !== 'after'}
                          className="bg-background border-border w-20 h-8"
                        />
                        <span className="text-sm text-muted-foreground">occurrences</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="endType"
                          checked={recurrenceRule.endType === 'until'}
                          onChange={() => setRecurrenceRule((r) => ({ ...r, endType: 'until' }))}
                          className="accent-primary"
                        />
                        <span className="text-sm">Until</span>
                        <Controller
                          control={control}
                          name="endDate"
                          render={() => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={recurrenceRule.endType !== 'until'}
                                  className={cn(
                                    "h-8 text-left font-normal bg-background border-border",
                                    !recurrenceRule.endUntilDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-3 w-3" />
                                  {recurrenceRule.endUntilDate
                                    ? format(new Date(recurrenceRule.endUntilDate), "MMM d, yyyy")
                                    : "Pick date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                                <Calendar
                                  mode="single"
                                  selected={recurrenceRule.endUntilDate ? new Date(recurrenceRule.endUntilDate) : undefined}
                                  onSelect={(date) => {
                                    if (date) setRecurrenceRule((r) => ({ ...r, endUntilDate: date.toISOString() }));
                                  }}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Preview text */}
                  <p className="text-xs text-primary bg-primary/5 rounded-lg px-3 py-2">
                    {describeRecurrence(recurrenceRule)}
                  </p>
                </div>
              )}
            </div>
          </WizardCard>
        )}

        {/* Image & Link Card */}
        <WizardCard icon={ImageIcon} title="Image & Link">
          <div className="space-y-4">
            {/* Show available images from import */}
            {availableImages.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Choose an image</Label>
                <div className="grid grid-cols-3 gap-2">
                  {availableImages.slice(0, 6).map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setImageUrl(img)}
                      className={cn(
                        "relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:opacity-90",
                        imageUrl === img 
                          ? "border-primary ring-2 ring-primary/20" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <img
                        src={img}
                        alt={`Option ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {imageUrl === img && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <ImageUpload value={imageUrl} onChange={setImageUrl} />

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground" />
                Event Link
              </Label>
              <Input
                id="location"
                type="url"
                placeholder="https://tickets.example.com"
                {...register("location")}
                className="bg-background border-border focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                Ticket link, Zoom URL, or any relevant link
              </p>
            </div>
          </div>
        </WizardCard>

        {/* Style Card */}
        <WizardCard icon={Palette} title="Style" collapsible defaultOpen={false}>
          <div className="space-y-4">
            {/* Text Alignment */}
            <div className="space-y-2">
              <Label>Text Alignment</Label>
              <div className="flex gap-2">
                {[
                  { value: 'left', icon: AlignLeft },
                  { value: 'center', icon: AlignCenter },
                  { value: 'right', icon: AlignRight },
                ].map(({ value, icon: Icon }) => (
                  <Button
                    key={value}
                    type="button"
                    variant={uiSchema.textAlign === value ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => updateUISchema('textAlign', value as UISchema['textAlign'])}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Image Size */}
            <div className="space-y-2">
              <Label>Image Size</Label>
              <Select
                value={uiSchema.imageSize}
                onValueChange={(value) => updateUISchema('imageSize', value as UISchema['imageSize'])}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="full">Full Width</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Button Style */}
            <div className="space-y-2">
              <Label>Button Style</Label>
              <Select
                value={uiSchema.buttonStyle}
                onValueChange={(value) => updateUISchema('buttonStyle', value as UISchema['buttonStyle'])}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </WizardCard>

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="glow"
            size="lg"
            className="flex-1"
            disabled={createEvent.isPending || updateEvent.isPending || createRecurring.isPending}
          >
            {createEvent.isPending || updateEvent.isPending || createRecurring.isPending
              ? (mode === 'edit' ? "Saving..." : "Creating...")
              : (mode === 'edit' ? "Save Changes" : isRecurring ? "Create Recurring Event" : "Create Event Page")}
            <Check className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>

      {/* Live Preview Column */}
      <div className="hidden lg:block">
        <div className="sticky top-8">
          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground text-center">Live Preview</p>
          </div>
          {previewEvent ? (
            <EventCard event={previewEvent} isPreview />
          ) : (
            <div className="bg-card rounded-2xl border border-border border-dashed p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Start filling out the form to see a live preview
              </p>
            </div>
          )}

          {watchedValues.timezone && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm text-muted-foreground">
                <Globe className="w-3.5 h-3.5" />
                {TIMEZONES.find(tz => tz.value === watchedValues.timezone)?.label || watchedValues.timezone}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
