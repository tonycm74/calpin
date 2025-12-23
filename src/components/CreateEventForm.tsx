import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, MapPin, Clock, FileText, Bell, Link as LinkIcon, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  imageUrl: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventFormProps {
  onEventCreated: (event?: EventData) => void;
}

export function CreateEventForm({ onEventCreated }: CreateEventFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const createEvent = useCreateEventPage();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const imageUrl = watch("imageUrl");

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setValue("imageUrl", url);
    if (url && url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
      setImagePreview(url);
    } else if (url && url.match(/^https?:\/\/.+/i)) {
      // Try to load it anyway
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const clearImage = () => {
    setValue("imageUrl", "");
    setImagePreview(null);
  };

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
      imageUrl: data.imageUrl || undefined,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Event Image */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl" className="flex items-center gap-2 text-foreground">
          <ImagePlus className="w-4 h-4 text-primary" />
          Event Image (optional)
        </Label>
        <Input
          id="imageUrl"
          placeholder="https://example.com/image.jpg"
          {...register("imageUrl")}
          onChange={handleImageUrlChange}
          className="bg-card border-border focus:border-primary"
        />
        {errors.imageUrl && (
          <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
        )}
        {imagePreview && (
          <div className="relative mt-2">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-40 object-cover rounded-lg border border-border"
              onError={() => setImagePreview(null)}
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full hover:bg-background transition-colors"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>
        )}
      </div>

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
          Location (optional)
        </Label>
        <Input
          id="location"
          placeholder="e.g., Madison Square Garden"
          {...register("location")}
          className="bg-card border-border focus:border-primary"
        />
      </div>

      {/* URL */}
      <div className="space-y-2">
        <Label htmlFor="url" className="flex items-center gap-2 text-foreground">
          <LinkIcon className="w-4 h-4 text-primary" />
          Event URL (optional)
        </Label>
        <Input
          id="url"
          placeholder="e.g., https://zoom.us/j/123456 or ticket link"
          {...register("url")}
          className="bg-card border-border focus:border-primary"
        />
        {errors.url && (
          <p className="text-sm text-destructive">{errors.url.message}</p>
        )}
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
}
