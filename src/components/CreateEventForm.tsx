import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, FileText, Bell, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ImageUpload";
import { EventCard } from "@/components/EventCard";
import { EventData, generateSlug } from "@/lib/calendar";
import { useCreateEventPage } from "@/hooks/useEventPages";
import { useAuth } from "@/hooks/useAuth";

const eventSchema = z.object({
  title: z.string().min(1, "Event title is required").max(100),
  description: z.string().max(500).optional(),
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().max(200).optional(),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventFormProps {
  onEventCreated: (event?: EventData) => void;
}

export function CreateEventForm({ onEventCreated }: CreateEventFormProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const createEvent = useCreateEventPage();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      location: "",
      url: "",
    },
  });

  // Watch form values for live preview
  const watchedValues = watch();

  // Generate preview event data
  const previewEvent = useMemo((): EventData | null => {
    const { title, startDate, startTime, endDate, endTime, description, location, url } = watchedValues;
    
    if (!title && !startDate && !startTime && !imageUrl) {
      return null;
    }

    let startDateTime: Date;
    try {
      if (startDate && startTime) {
        startDateTime = new Date(`${startDate}T${startTime}`);
      } else if (startDate) {
        startDateTime = new Date(`${startDate}T12:00`);
      } else {
        startDateTime = new Date();
      }
    } catch {
      startDateTime = new Date();
    }

    let endDateTime: Date | undefined;
    if (endDate && endTime) {
      try {
        endDateTime = new Date(`${endDate}T${endTime}`);
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
      url: url || undefined,
      imageUrl: imageUrl,
      slug: generateSlug(title || "preview"),
      reminderMinutes: [60, 1440],
    };
  }, [watchedValues, imageUrl]);

  const onSubmit = async (data: EventFormData) => {
    const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
    let endDateTime: Date | undefined;
    
    if (data.endDate && data.endTime) {
      endDateTime = new Date(`${data.endDate}T${data.endTime}`);
    }

    const event: EventData = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      startTime: startDateTime,
      endTime: endDateTime,
      location: data.location || undefined,
      url: data.url || undefined,
      imageUrl: imageUrl,
      slug: generateSlug(data.title),
      reminderMinutes: [60, 1440],
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
          <Calendar className="w-4 h-4 text-primary" />
          Start Date & Time
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            {...register("startDate")}
            className="bg-card border-border focus:border-primary"
          />
          <Input
            type="time"
            {...register("startTime")}
            className="bg-card border-border focus:border-primary"
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
          <Clock className="w-4 h-4 text-muted-foreground" />
          End Date & Time (optional)
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            {...register("endDate")}
            className="bg-card border-border focus:border-primary"
          />
          <Input
            type="time"
            {...register("endTime")}
            className="bg-card border-border focus:border-primary"
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

      {/* Reminders Note */}
      <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg border border-border">
        <Bell className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Default Reminders</p>
          <p className="text-xs text-muted-foreground mt-1">
            Visitors will get reminders 1 hour and 1 day before the event.
          </p>
        </div>
      </div>

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
                <Calendar className="w-8 h-8 text-muted-foreground" />
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
