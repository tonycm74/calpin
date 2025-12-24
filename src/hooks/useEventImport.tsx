import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ImportedEventInfo {
  title: string | null;
  description: string | null;
  date: string | null;
  time: string | null;
  timezone: string | null;
  location: string | null;
  venue: string | null;
  image_url: string | null;
  ticket_url: string | null;
}

export interface ExtractEventResult {
  data: ImportedEventInfo;
  images: string[]; // Additional images from Perplexity search
}

interface ExtractEventResponse {
  success: boolean;
  data: ImportedEventInfo;
  images?: string[];
  source_url: string;
  error?: string;
}

export function useEventImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractEventInfo = async (url: string): Promise<ExtractEventResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke<ExtractEventResponse>(
        'extract-event-info',
        {
          body: { url }
        }
      );

      if (fnError) {
        console.error('Function error:', fnError);
        setError(fnError.message || 'Failed to extract event information');
        return null;
      }

      if (!data?.success) {
        setError(data?.error || 'Failed to extract event information');
        return null;
      }

      return {
        data: data.data,
        images: data.images || []
      };
    } catch (err) {
      console.error('Error extracting event info:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    extractEventInfo,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}

