import { useParams, Link } from 'react-router-dom';
import { Calendar, Loader2 } from 'lucide-react';
import { EventCard } from '@/components/EventCard';
import { SEOHead } from '@/components/SEOHead';
import { useEventPageBySlug, eventPageToEventData, useTrackCalendarAdd } from '@/hooks/useEventPages';
import { useTrackPageView } from '@/hooks/useEventAnalytics';

const EventPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: eventPage, isLoading, error } = useEventPageBySlug(slug);
  const trackCalendarAdd = useTrackCalendarAdd();
  
  // Track page view when event loads
  useTrackPageView(eventPage?.id);

  const handleAddToCalendar = (calendarType: string) => {
    if (eventPage) {
      trackCalendarAdd.mutate({
        eventPageId: eventPage.id,
        calendarType,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !eventPage) {
    return (
      <>
        <SEOHead title="Event Not Found | CalPing" />
        <div className="min-h-screen bg-background">
          <header className="border-b border-border">
            <div className="container py-4">
              <Link to="/" className="flex items-center gap-2 w-fit">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">CalPing</span>
              </Link>
            </div>
          </header>
          <main className="container py-20 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Event not found</h1>
            <p className="text-muted-foreground">This event page doesn't exist or has been removed.</p>
          </main>
        </div>
      </>
    );
  }

  const eventData = eventPageToEventData(eventPage);

  return (
    <>
      <SEOHead 
        title={`${eventPage.title} | CalPing`}
        description={eventPage.description || `Add ${eventPage.title} to your calendar`}
      />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {/* Event Content */}
        <div className="w-full max-w-md animate-fade-up">
          <EventCard 
            event={eventData} 
            onAddToCalendar={handleAddToCalendar}
          />
        </div>

        {/* Background Glow */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-primary/5 rounded-full blur-3xl" />
        </div>
      </div>
    </>
  );
};

export default EventPage;
