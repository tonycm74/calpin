import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export interface PlaceResult {
  place_id: string;
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  photo_urls: string[];
}

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.places) {
      resolve();
      return;
    }

    // Check if script is already loading
    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlacesAutocompleteProps {
  onPlaceSelected: (place: PlaceResult) => void;
}

export function PlacesAutocomplete({ onPlaceSelected }: PlacesAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const dummyDiv = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setSdkError(true);
      return;
    }

    loadGoogleMapsScript()
      .then(() => {
        autocompleteService.current = new google.maps.places.AutocompleteService();
        // PlacesService needs a DOM element or map
        if (!dummyDiv.current) {
          dummyDiv.current = document.createElement('div');
        }
        placesService.current = new google.maps.places.PlacesService(dummyDiv.current);
        setSdkReady(true);
      })
      .catch(() => {
        setSdkError(true);
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchPredictions = useCallback(
    (input: string) => {
      if (!autocompleteService.current || input.length < 2) {
        setPredictions([]);
        return;
      }

      setLoading(true);
      autocompleteService.current.getPlacePredictions(
        {
          input,
          types: ['establishment'],
        },
        (results, status) => {
          setLoading(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results as unknown as Prediction[]);
            setIsOpen(true);
          } else {
            setPredictions([]);
          }
        }
      );
    },
    []
  );

  const handleInputChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => fetchPredictions(value), 300);
  };

  const handleSelect = (prediction: Prediction) => {
    if (!placesService.current) return;

    setQuery(prediction.structured_formatting.main_text);
    setIsOpen(false);
    setPredictions([]);
    setLoading(true);

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['name', 'formatted_address', 'formatted_phone_number', 'website', 'photos', 'place_id'],
      },
      (place, status) => {
        setLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const photoUrls: string[] = [];
          if (place.photos) {
            for (const photo of place.photos) {
              photoUrls.push(photo.getUrl({ maxWidth: 1200, maxHeight: 600 }));
            }
          }

          onPlaceSelected({
            place_id: place.place_id || prediction.place_id,
            name: place.name || '',
            address: place.formatted_address || '',
            phone: place.formatted_phone_number || null,
            website: place.website || null,
            photo_urls: photoUrls,
          });
        }
      }
    );
  };

  if (sdkError || !GOOGLE_MAPS_API_KEY) {
    return null;
  }

  if (!sdkReady) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading Google Maps...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => predictions.length > 0 && setIsOpen(true)}
          placeholder="Search for your venue on Google Maps..."
          className="bg-background border-border pl-10 pr-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              onClick={() => handleSelect(prediction)}
              className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors flex items-start gap-2.5"
            >
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="font-medium text-sm text-foreground truncate">
                  {prediction.structured_formatting.main_text}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {prediction.structured_formatting.secondary_text}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
