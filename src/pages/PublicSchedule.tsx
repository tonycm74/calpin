import { useParams, Link } from 'react-router-dom';
import { Calendar, Loader2, MapPin, CalendarPlus, ChevronDown, Copy, Check, Phone, Globe, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isPast, isToday, startOfDay, addDays } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SEOHead } from '@/components/SEOHead';
import { useProfileByUsername, usePublicEvents } from '@/hooks/useProfile';
import { CATEGORY_LABELS, EventCategory } from '@/lib/calendar';
import { EventPage } from '@/hooks/useEventPages';
import { useToast } from '@/hooks/use-toast';

const FEED_BASE = 'https://tgsoqzqtodoikvuiuqai.supabase.co/functions/v1/calendar-feed';

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

function groupEventsByWeek(events: EventPage[]) {
  const now = startOfDay(new Date());
  const upcoming = events.filter((e) => !isPast(new Date(e.start_time)) || isToday(new Date(e.start_time)));

  const groups: { label: string; events: EventPage[] }[] = [];
  const thisWeekEnd = addDays(now, 7);

  const thisWeek = upcoming.filter((e) => new Date(e.start_time) < thisWeekEnd);
  const later = upcoming.filter((e) => new Date(e.start_time) >= thisWeekEnd);

  if (thisWeek.length > 0) {
    groups.push({ label: 'This Week', events: thisWeek });
  }

  if (later.length > 0) {
    // Group remaining by week
    let currentGroup: EventPage[] = [];
    let currentLabel = '';

    for (const event of later) {
      const eventDate = new Date(event.start_time);
      const weekLabel = `Week of ${format(eventDate, 'MMM d')}`;

      if (weekLabel !== currentLabel) {
        if (currentGroup.length > 0) {
          groups.push({ label: currentLabel, events: currentGroup });
        }
        currentLabel = weekLabel;
        currentGroup = [event];
      } else {
        currentGroup.push(event);
      }
    }
    if (currentGroup.length > 0) {
      groups.push({ label: currentLabel, events: currentGroup });
    }
  }

  return groups;
}

const PublicSchedule = () => {
  const { username } = useParams<{ username: string }>();
  const { data: profile, isLoading: profileLoading } = useProfileByUsername(username);
  const { data: events, isLoading: eventsLoading } = usePublicEvents(profile?.user_id);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const isLoading = profileLoading || eventsLoading;
  const feedUrl = `${FEED_BASE}?username=${username}`;

  const handleCopyFeed = () => {
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    toast({ title: 'Feed URL copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoogleSubscribe = () => {
    const webcalUrl = feedUrl.replace('https://', 'webcal://');
    window.open(`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`, '_blank');
  };

  const handleAppleSubscribe = () => {
    window.location.href = feedUrl.replace('https://', 'webcal://');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <>
        <SEOHead title="Venue Not Found | CalDrop" />
        <div className="min-h-screen bg-background">
          <header className="border-b border-border">
            <div className="container py-4">
              <Link to="/" className="flex items-center gap-2 w-fit">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">CalDrop</span>
              </Link>
            </div>
          </header>
          <main className="container py-20 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Venue not found</h1>
            <p className="text-muted-foreground">This venue page doesn't exist yet.</p>
          </main>
        </div>
      </>
    );
  }

  const grouped = groupEventsByWeek(events || []);

  const images = profile.venue_images?.length
    ? profile.venue_images
    : profile.venue_image_url
      ? [profile.venue_image_url]
      : [];

  return (
    <>
      <SEOHead
        title={`${profile.venue_name || username} Schedule | CalDrop`}
        description={profile.venue_description || `Upcoming events at ${profile.venue_name || username}`}
      />
      <div className="min-h-screen bg-background">
        {/* Photo Banner — mobile only */}
        {images.length > 0 && (
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-secondary group lg:hidden">
            <img
              src={images[photoIndex] || images[0]}
              alt={`${profile.venue_name || ''} photo ${photoIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIndex((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPhotoIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === photoIndex ? 'bg-white w-4' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Main Content: 2-column on desktop */}
        <div className="container py-6 lg:py-8 max-w-5xl mx-auto">
          <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">

            {/* Left Column: Venue Info + Events */}
            <div className="min-w-0">
              {/* Venue Header */}
              <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {profile.venue_name || username}
                </h1>
                {profile.venue_address && (
                  <a
                    href={
                      profile.google_place_id
                        ? `https://www.google.com/maps/place/?q=place_id:${profile.google_place_id}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.venue_address)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 mt-1 transition-colors"
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    {profile.venue_address}
                  </a>
                )}
                {profile.venue_description && (
                  <p className="text-foreground/80 mt-3 max-w-xl leading-relaxed">{profile.venue_description}</p>
                )}
                {/* Contact info — shown inline on mobile, hidden on desktop (shown in sidebar) */}
                {(profile.venue_phone || profile.venue_website) && (
                  <div className="flex flex-wrap items-center gap-3 mt-3 lg:hidden">
                    {profile.venue_phone && (
                      <a href={`tel:${profile.venue_phone}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                        {profile.venue_phone}
                      </a>
                    )}
                    {profile.venue_website && (
                      <a
                        href={profile.venue_website.startsWith('http') ? profile.venue_website : `https://${profile.venue_website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {profile.venue_website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Subscribe */}
                <div className="mt-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="glow" size="sm">
                        <CalendarPlus className="w-4 h-4" />
                        Subscribe
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuItem onClick={handleGoogleSubscribe} className="cursor-pointer">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/2048px-Google_Calendar_icon_%282020%29.svg.png" alt="Google Calendar" className="w-4 h-4 mr-2 object-contain" />
                        Google Calendar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleAppleSubscribe} className="cursor-pointer">
                        <img src="https://cdn.jim-nielsen.com/macos/512/calendar-2021-04-29.png?rf=1024" alt="Apple Calendar" className="w-4 h-4 mr-2 object-contain" />
                        Apple Calendar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleCopyFeed} className="cursor-pointer">
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? 'Copied!' : 'Copy Feed URL'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Google Maps — shown on mobile, hidden on desktop (shown in sidebar) */}
              {profile.venue_address && (
                <div className="rounded-xl overflow-hidden border border-border mb-6 lg:hidden">
                  <iframe
                    title={`Map of ${profile.venue_name || username}`}
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={
                        `https://maps.google.com/maps?q=${encodeURIComponent((profile.venue_name ? profile.venue_name + ', ' : '') + profile.venue_address)}&z=16&ie=UTF8&iwloc=&output=embed`
                    }
                  />
                </div>
              )}

              {/* Events List */}
              {grouped.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">No upcoming events</h2>
                  <p className="text-muted-foreground">Check back soon for new events!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {grouped.map((group) => (
                    <div key={group.label}>
                      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        {group.label}
                      </h2>
                      <div className="space-y-3">
                        {group.events.map((event) => (
                          <Link
                            key={event.id}
                            to={`/e/${event.slug}`}
                            className="block bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {event.category && event.category !== 'other' && (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                                      {CATEGORY_LABELS[event.category as EventCategory] || event.category}
                                    </span>
                                  )}
                                  {event.page_type === 'rsvp' && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                      RSVP
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
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Sidebar (desktop only) */}
            <aside className="hidden lg:block">
              <div className="sticky top-8 space-y-5">
                {/* Photos Card */}
                {images.length > 0 && (
                  <div className="rounded-xl overflow-hidden border border-border bg-card">
                    <div className="relative aspect-[4/3] overflow-hidden group">
                      <img
                        src={images[photoIndex] || images[0]}
                        alt={`${profile.venue_name || ''} photo ${photoIndex + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-300"
                      />
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={() => setPhotoIndex((prev) => (prev - 1 + images.length) % images.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPhotoIndex((prev) => (prev + 1) % images.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                    {images.length > 1 && (
                      <div className="flex gap-1 p-1.5 overflow-x-auto">
                        {images.map((url, i) => (
                          <button
                            key={i}
                            onClick={() => setPhotoIndex(i)}
                            className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden transition-all ${
                              i === photoIndex
                                ? 'ring-2 ring-primary opacity-100'
                                : 'opacity-50 hover:opacity-80'
                            }`}
                          >
                            <img src={url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Contact Card */}
                {(profile.venue_phone || profile.venue_website) && (
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="font-semibold text-foreground mb-3">Contact</h3>
                    <div className="space-y-2.5">
                      {profile.venue_phone && (
                        <a href={`tel:${profile.venue_phone}`} className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          {profile.venue_phone}
                        </a>
                      )}
                      {profile.venue_website && (
                        <a
                          href={profile.venue_website.startsWith('http') ? profile.venue_website : `https://${profile.venue_website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Globe className="w-4 h-4 flex-shrink-0" />
                          {profile.venue_website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {profile.venue_address && (
                        <a
                          href={
                            profile.google_place_id
                              ? `https://www.google.com/maps/place/?q=place_id:${profile.google_place_id}`
                              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.venue_address)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          {profile.venue_address}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Map Card */}
                {profile.venue_address && (
                  <div className="rounded-xl overflow-hidden border border-border">
                    <iframe
                      title={`Map of ${profile.venue_name || username}`}
                      width="100%"
                      height="220"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={
                        `https://maps.google.com/maps?q=${encodeURIComponent((profile.venue_name ? profile.venue_name + ', ' : '') + profile.venue_address)}&z=16&ie=UTF8&iwloc=&output=embed`
                      }
                    />
                  </div>
                )}
              </div>
            </aside>

          </div>
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

export default PublicSchedule;
