import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Search, MapPin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import { useSearchVenues, useEventsForVenues, Profile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { CATEGORY_LABELS, EventCategory } from '@/lib/calendar';
import { EventPage } from '@/hooks/useEventPages';

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'trivia': 'bg-blue-500/10 text-blue-400',
    'karaoke': 'bg-pink-500/10 text-pink-400',
    'live-music': 'bg-purple-500/10 text-purple-400',
    'dj-night': 'bg-violet-500/10 text-violet-400',
    'happy-hour': 'bg-amber-500/10 text-amber-400',
    'brunch': 'bg-orange-500/10 text-orange-400',
    'bingo': 'bg-green-500/10 text-green-400',
    'open-mic': 'bg-teal-500/10 text-teal-400',
    'comedy': 'bg-yellow-500/10 text-yellow-400',
    'sports': 'bg-red-500/10 text-red-400',
    'theme-night': 'bg-indigo-500/10 text-indigo-400',
    'other': 'bg-secondary text-muted-foreground',
  };
  return colors[category] || colors['other'];
}

const SUGGESTIONS = ['Patchogue, NY', 'Austin, TX', 'Brooklyn, NY', 'Nashville, TN', 'Portland, OR'];

const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query) {
        setSearchParams({ q: query }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, setSearchParams]);

  const { data: venues, isLoading: venuesLoading } = useSearchVenues(debouncedQuery);
  const userIds = (venues || []).map((v) => v.user_id);
  const { data: events, isLoading: eventsLoading } = useEventsForVenues(userIds);

  const isLoading = venuesLoading || eventsLoading;
  const hasSearched = debouncedQuery.length >= 2;

  // Map user_id → profile for event cards
  const venueMap = new Map<string, Profile>();
  (venues || []).forEach((v) => venueMap.set(v.user_id, v));

  // Count events per venue
  const eventCounts = new Map<string, number>();
  (events || []).forEach((e) => {
    eventCounts.set(e.user_id, (eventCounts.get(e.user_id) || 0) + 1);
  });

  const handleSuggestion = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <>
      <SEOHead
        title={debouncedQuery ? `Events in ${debouncedQuery} | CalDrop` : 'Discover Events | CalDrop'}
        description="Find trivia nights, karaoke, live music, and more at venues near you."
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="container py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">CalDrop</span>
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Search Section */}
        <div className="border-b border-border bg-card/50">
          <div className="container py-8 max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Discover Events
            </h1>
            <p className="text-muted-foreground mb-6">
              Find trivia, karaoke, live music, and more at venues near you.
            </p>
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a town or city..."
                className="pl-12 pr-4 h-12 text-lg bg-background border-border rounded-xl"
                autoFocus
              />
              {isLoading && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container py-8 max-w-5xl mx-auto">
          {/* Before search — suggestions */}
          {!hasSearched && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Find events near you</h2>
              <p className="text-muted-foreground mb-6">Try searching for a city or town</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm rounded-full transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {hasSearched && !isLoading && (venues || []).length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No venues found</h2>
              <p className="text-muted-foreground">
                No venues found in "{debouncedQuery}". Try another city.
              </p>
            </div>
          )}

          {/* Results */}
          {hasSearched && (venues || []).length > 0 && (
            <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8">
              {/* Left: Events Feed */}
              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  {(events || []).length} upcoming event{(events || []).length !== 1 ? 's' : ''}
                </h2>

                {(events || []).length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <p className="text-muted-foreground">No upcoming events at these venues yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(events || []).map((event: EventPage) => {
                      const venue = venueMap.get(event.user_id);
                      return (
                        <Link
                          key={event.id}
                          to={`/e/${event.slug}`}
                          className="block bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              {venue && (
                                <p className="text-xs text-muted-foreground mb-1 truncate">
                                  {venue.venue_name || venue.username}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mb-1">
                                {event.category && event.category !== 'other' && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                                    {CATEGORY_LABELS[event.category as EventCategory] || event.category}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold text-foreground truncate">{event.title}</h3>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {format(new Date(event.start_time), 'EEEE, MMM d')} at{' '}
                                {format(new Date(event.start_time), 'h:mm a')}
                                {event.end_time && ` - ${format(new Date(event.end_time), 'h:mm a')}`}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-2xl font-bold text-foreground">
                                {format(new Date(event.start_time), 'd')}
                              </div>
                              <div className="text-xs text-muted-foreground uppercase">
                                {format(new Date(event.start_time), 'MMM')}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right: Venues Sidebar */}
              <aside>
                {/* Mobile: horizontal scroll */}
                <div className="lg:hidden mb-6 -mx-4 px-4">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    {(venues || []).length} venue{(venues || []).length !== 1 ? 's' : ''}
                  </h2>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {(venues || []).map((venue) => (
                      <Link
                        key={venue.id}
                        to={`/${venue.username}`}
                        className="flex-shrink-0 w-56 bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
                      >
                        {(venue.venue_image_url || (venue.venue_images && venue.venue_images[0])) && (
                          <div className="h-28 bg-secondary overflow-hidden">
                            <img
                              src={venue.venue_image_url || venue.venue_images![0]}
                              alt={venue.venue_name || ''}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-3">
                          <h3 className="font-semibold text-foreground text-sm truncate">
                            {venue.venue_name || venue.username}
                          </h3>
                          {venue.venue_address && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              {venue.venue_address}
                            </p>
                          )}
                          <p className="text-xs text-primary mt-1">
                            {eventCounts.get(venue.user_id) || 0} upcoming event{(eventCounts.get(venue.user_id) || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Desktop: sticky sidebar */}
                <div className="hidden lg:block">
                  <div className="sticky top-8 space-y-4">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {(venues || []).length} venue{(venues || []).length !== 1 ? 's' : ''}
                    </h2>
                    {(venues || []).map((venue) => (
                      <Link
                        key={venue.id}
                        to={`/${venue.username}`}
                        className="block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
                      >
                        {(venue.venue_image_url || (venue.venue_images && venue.venue_images[0])) && (
                          <div className="h-32 bg-secondary overflow-hidden">
                            <img
                              src={venue.venue_image_url || venue.venue_images![0]}
                              alt={venue.venue_name || ''}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground truncate">
                            {venue.venue_name || venue.username}
                          </h3>
                          {venue.venue_address && (
                            <p className="text-sm text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                              {venue.venue_address}
                            </p>
                          )}
                          {venue.venue_description && (
                            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{venue.venue_description}</p>
                          )}
                          <p className="text-xs text-primary mt-2 font-medium">
                            {eventCounts.get(venue.user_id) || 0} upcoming event{(eventCounts.get(venue.user_id) || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-border py-6">
          <div className="container text-center">
            <p className="text-xs text-muted-foreground">
              Powered by <Link to="/" className="text-primary hover:underline font-medium">CalDrop</Link>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Discover;
