import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { EventData, UISchema, defaultUISchema, generateSlug } from '@/lib/calendar';
import { useToast } from '@/hooks/use-toast';

export interface EventPage {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  url: string | null;
  image_url: string | null;
  slug: string;
  reminder_minutes: number[] | null;
  ui_schema: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export function useEventPages() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['event-pages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('event_pages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EventPage[];
    },
    enabled: !!user,
  });
}

export function useEventPageBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['event-page', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('event_pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as EventPage | null;
    },
    enabled: !!slug,
  });
}

export function useCreateEventPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (event: EventData) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('event_pages')
        .insert({
          user_id: user.id,
          title: event.title,
          description: event.description || null,
          start_time: event.startTime.toISOString(),
          end_time: event.endTime?.toISOString() || null,
          location: event.location || null,
          url: event.url || null,
          image_url: event.imageUrl || null,
          slug: generateSlug(event.title),
          reminder_minutes: event.reminderMinutes || [60, 1440],
          ui_schema: event.uiSchema || defaultUISchema,
        })
        .select()
        .single();

      if (error) throw error;
      return data as EventPage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-pages'] });
      toast({
        title: 'Event created!',
        description: 'Your event page is ready to share.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteEventPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('event_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-pages'] });
      toast({
        title: 'Event deleted',
        description: 'The event page has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useTrackCalendarAdd() {
  return useMutation({
    mutationFn: async ({ eventPageId, calendarType }: { eventPageId: string; calendarType: string }) => {
      const { error } = await supabase
        .from('calendar_adds')
        .insert({
          event_page_id: eventPageId,
          calendar_type: calendarType,
        });

      if (error) throw error;
    },
  });
}

export function useUpdateEventPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (event: EventData & { id: string }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('event_pages')
        .update({
          title: event.title,
          description: event.description || null,
          start_time: event.startTime.toISOString(),
          end_time: event.endTime?.toISOString() || null,
          location: event.location || null,
          url: event.url || null,
          image_url: event.imageUrl || null,
          reminder_minutes: event.reminderMinutes || [60, 1440],
          ui_schema: event.uiSchema || defaultUISchema,
        })
        .eq('id', event.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as EventPage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-pages'] });
      queryClient.invalidateQueries({ queryKey: ['event-page'] });
      toast({
        title: 'Event updated!',
        description: 'Your changes have been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating event',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Helper to convert database EventPage to EventData
export function eventPageToEventData(page: EventPage): EventData {
  return {
    id: page.id,
    title: page.title,
    description: page.description || undefined,
    startTime: new Date(page.start_time),
    endTime: page.end_time ? new Date(page.end_time) : undefined,
    location: page.location || undefined,
    url: page.url || undefined,
    imageUrl: page.image_url || undefined,
    slug: page.slug,
    reminderMinutes: page.reminder_minutes || [60, 1440],
    uiSchema: (page.ui_schema as UISchema) || defaultUISchema,
  };
}
