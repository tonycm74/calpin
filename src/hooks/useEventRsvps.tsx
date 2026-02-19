import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EventRsvp {
  id: string;
  event_page_id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
}

/** Submit an RSVP (public — no auth required) */
export function useSubmitRsvp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      eventPageId,
      name,
      email,
      status = 'confirmed',
    }: {
      eventPageId: string;
      name: string;
      email: string;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from('event_rsvps')
        .insert({
          event_page_id: eventPageId,
          name,
          email,
          status,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already RSVP\'d to this event.');
        }
        throw error;
      }
      return data as EventRsvp;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rsvp-count', variables.eventPageId] });
      queryClient.invalidateQueries({ queryKey: ['event-rsvps', variables.eventPageId] });
    },
    onError: (error) => {
      toast({
        title: 'RSVP failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/** Fetch all RSVPs for an event (authenticated — event owner only) */
export function useEventRsvps(eventPageId: string | undefined) {
  return useQuery({
    queryKey: ['event-rsvps', eventPageId],
    queryFn: async () => {
      if (!eventPageId) return [];

      const { data, error } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_page_id', eventPageId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EventRsvp[];
    },
    enabled: !!eventPageId,
  });
}

/** Fetch count of confirmed RSVPs (public — for showing spots left) */
export function useRsvpCount(eventPageId: string | undefined) {
  return useQuery({
    queryKey: ['rsvp-count', eventPageId],
    queryFn: async () => {
      if (!eventPageId) return 0;

      const { count, error } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_page_id', eventPageId)
        .eq('status', 'confirmed');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!eventPageId,
  });
}
