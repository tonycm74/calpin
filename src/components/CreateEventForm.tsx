import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, FileText, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ImageUpload } from "@/components/ImageUpload";
import { EventCard } from "@/components/EventCard";
import { TimePicker } from "@/components/TimePicker";
import { ReminderSettings } from "@/components/ReminderSettings";
import { EventData, generateSlug } from "@/lib/calendar";
import { useCreateEventPage } from "@/hooks/useEventPages";
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
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventFormProps {
  onEventCreated: (event?: EventData) => void;
}

export function CreateEventForm({ onEventCreated }: CreateEventFormProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [reminders, setReminders] = useState<number[]>([60, 1440]);
  const createEvent = useCreateEventPage();
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
      title: "",
      description: "",
      startDate: undefined,
      startTime: "",
      endDate: undefined,
      endTime: "",
      location: "",
    },
  });

  // Watch form values for live preview
  const watchedValues = watch();

  // Generate preview event data
  const previewEvent = useMemo((): EventData | null => {
    const { title, startDate, startTime, endDate, endTime, description, location } = watchedValues;
    
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
      id: "preview",
      title: title || "Your Event Title",
      description: description || undefined,
      startTime: startDateTime,
      endTime: endDateTime,
      location: location || undefined,
      url: undefined,
      imageUrl: imageUrl,
      slug: generateSlug(title || "preview"),
      reminderMinutes: reminders,
    };
  }, [watchedValues, imageUrl, reminders]);

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
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      startTime: startDateTime,
      endTime: endDateTime,
      location: data.location || undefined,
      url: undefined,
      imageUrl: imageUrl,
      slug: generateSlug(data.title),
      reminderMinutes: reminders,
    };

    if (user) {
      await createEvent.mutateAsync(event);
      onEventCreated();
    } else {
      onEventCreated(event);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Event Image */}
      <ImageUpload value={imageUrl} onChange={setImageUrl} />

      {/* Event Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="flex items-center gap-2 text-foreground">
          <FileText className="w-4 h-4 text-primary" />
          Event Name
        </Label>
        <Input
          id="title"
          placeholder="e.g., Knicks vs Celtics"
          {...register("title")}
          className="bg-card border-border focus:border-primary"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground">
          Description (optional)
        </Label>
        <Textarea
          id="description"
          placeholder="Add event details..."
          rows={3}
          {...register("description")}
          className="bg-card border-border focus:border-primary resize-none"
        />
      </div>

      {/* Start Date & Time */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-foreground">
          <CalendarIcon className="w-4 h-4 text-primary" />
          Start Date & Time
        </Label>
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
                      "w-full justify-start text-left font-normal bg-card border-border",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
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
                placeholder="Select time"
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
        <Label className="flex items-center gap-2 text-foreground">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          End Date & Time (optional)
        </Label>
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
                      "w-full justify-start text-left font-normal bg-card border-border",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ?? undefined}
                    onSelect={field.onChange}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
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
                placeholder="Select time"
              />
            )}
          />
        </div>
      </div>

      {/* Event Link */}
      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center gap-2 text-foreground">
          <LinkIcon className="w-4 h-4 text-primary" />
          Event Link (optional)
        </Label>
        <Input
          id="location"
          type="url"
          placeholder="e.g., https://zoom.us/j/123456 or ticket link"
          {...register("location")}
          className="bg-card border-border focus:border-primary"
        />
      </div>

      {/* Reminder Settings */}
      <ReminderSettings value={reminders} onChange={setReminders} />

      {/* Submit Button */}
      <Button
        type="submit"
        variant="glow"
        size="xl"
        className="w-full"
        disabled={createEvent.isPending}
      >
        {createEvent.isPending ? "Creating..." : "Create Event Page"}
      </Button>
    </form>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Form Column */}
      <div>{formContent}</div>

      {/* Live Preview Column */}
      <div className="hidden lg:block">
        <div className="sticky top-8">
          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground text-center">Live Preview</p>
          </div>
          {previewEvent ? (
            <EventCard event={previewEvent} />
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
        </div>
      </div>
    </div>
  );
}
