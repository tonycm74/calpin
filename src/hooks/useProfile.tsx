import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { EventPage } from './useEventPages';

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  username: string | null;
  venue_name: string | null;
  venue_description: string | null;
  venue_address: string | null;
  venue_image_url: string | null;
  venue_phone: string | null;
  venue_website: string | null;
  google_place_id: string | null;
  venue_images: string[] | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: {
      username?: string;
      venue_name?: string | null;
      venue_description?: string | null;
      venue_address?: string | null;
      venue_image_url?: string | null;
      venue_phone?: string | null;
      venue_website?: string | null;
      google_place_id?: string | null;
      venue_images?: string[] | null;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('This username is already taken. Please choose another.');
        }
        throw error;
      }
      return data as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Profile updated!',
        description: 'Your venue details have been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useProfileByUsername(username: string | undefined) {
  return useQuery({
    queryKey: ['profile-by-username', username],
    queryFn: async () => {
      if (!username) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!username,
  });
}

export function useSearchVenues(query: string) {
  return useQuery({
    queryKey: ['search-venues', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('username', 'is', null)
        .ilike('venue_address', `%${query}%`);

      if (error) throw error;
      return data as Profile[];
    },
    enabled: query.length >= 2,
  });
}

export function useEventsForVenues(userIds: string[]) {
  return useQuery({
    queryKey: ['events-for-venues', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];

      const { data, error } = await supabase
        .from('event_pages')
        .select('*')
        .in('user_id', userIds)
        .eq('is_recurring_parent', false)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as EventPage[];
    },
    enabled: userIds.length > 0,
  });
}

export function usePublicEvents(userId: string | undefined) {
  return useQuery({
    queryKey: ['public-events', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('event_pages')
        .select('*')
        .eq('user_id', userId)
        .eq('is_recurring_parent', false)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as EventPage[];
    },
    enabled: !!userId,
  });
}
