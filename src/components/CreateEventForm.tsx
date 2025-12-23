import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, MapPin, Clock, FileText, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EventData, generateSlug } from "@/lib/calendar";

const eventSchema = z.object({
  title: z.string().min(1, "Event title is required").max(100),
  description: z.string().max(500).optional(),
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().max(200).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventFormProps {
  onEventCreated: (event: EventData) => void;
}

export function CreateEventForm({ onEventCreated }: CreateEventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = (data: EventFormData) => {
    setIsSubmitting(true);
    
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
      location: data.location,
      slug: generateSlug(data.title),
      reminderMinutes: [60, 1440], // 1 hour and 1 day before
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onEventCreated(event);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center gap-2 text-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          Location or URL (optional)
        </Label>
        <Input
          id="location"
          placeholder="e.g., Madison Square Garden or https://zoom.us/..."
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
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Create Event Page"}
      </Button>
    </form>
  );
}
