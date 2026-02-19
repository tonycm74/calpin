import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Plus, LogOut, Users, Settings, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import { CreateEventWizard } from '@/components/CreateEventWizard';
import { EventCalendar } from '@/components/EventCalendar';
import { useAuth } from '@/hooks/useAuth';
import { useEventPages, useDeleteEventPage, eventPageToEventData, EventPage } from '@/hooks/useEventPages';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { EventData } from '@/lib/calendar';

const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: eventPages, isLoading } = useEventPages();
  const { data: profile } = useProfile();
  const deleteEvent = useDeleteEventPage();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleEventCreated = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleEditEvent = (page: EventPage) => {
    const eventData = eventPageToEventData(page);
    setEditingEvent(eventData);
    setShowForm(true);
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/e/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link copied!',
      description: 'Share this link with your patrons.',
    });
  };

  const copyScheduleLink = () => {
    if (profile?.username) {
      const url = `${window.location.origin}/${profile.username}`;
      navigator.clipboard.writeText(url);
      toast({
        title: 'Schedule link copied!',
        description: 'Share this link so patrons can subscribe to your calendar.',
      });
    }
  };

  if (showForm) {
    return (
      <>
        <SEOHead title={editingEvent ? "Edit Event | CalDrop" : "Add Event | CalDrop"} />
        <div className="min-h-screen bg-background">
          <header className="border-b border-border">
            <div className="container py-4 flex items-center justify-between">
              <button onClick={() => { setShowForm(false); setEditingEvent(null); }} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">CalDrop</span>
              </button>
            </div>
          </header>

          <main className="container py-12">
            <div className="max-w-5xl mx-auto">
              <div className="animate-fade-up">
                <CreateEventWizard
                  onEventCreated={handleEventCreated}
                  existingEvent={editingEvent || undefined}
                  mode={editingEvent ? 'edit' : 'create'}
                  onCancel={() => { setShowForm(false); setEditingEvent(null); }}
                />
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Dashboard | CalDrop" />
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
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/attendees">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Attendees</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/settings">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Venue</span>
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Sign Out</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8">
          {/* Venue setup banner */}
          {!profile?.username && (
            <div className="mb-6 bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-up">
              <div>
                <p className="font-medium text-foreground">Set up your venue URL to share your schedule</p>
                <p className="text-sm text-muted-foreground">Get a public page where patrons can subscribe to your events</p>
              </div>
              <Button variant="glow" size="sm" asChild>
                <Link to="/dashboard/settings">
                  <Settings className="w-4 h-4" />
                  Set Up Venue
                </Link>
              </Button>
            </div>
          )}

          {/* Share schedule button (when username is set) */}
          {profile?.username && (
            <div className="mb-6 flex items-center gap-2 animate-fade-up">
              <Button variant="outline" size="sm" onClick={copyScheduleLink}>
                <Share2 className="w-4 h-4" />
                Share Schedule
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/${profile.username}`}>
                  <ExternalLink className="w-4 h-4" />
                  View Public Page
                </Link>
              </Button>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6 animate-fade-up">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your Schedule</h1>
              <p className="text-muted-foreground">
                Click any date to add an event
              </p>
            </div>
            <Button variant="glow" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" />
              Add Event
            </Button>
          </div>

          {/* Calendar */}
          <EventCalendar
            eventPages={eventPages}
            isLoading={isLoading}
            onCreateEvent={() => setShowForm(true)}
            onEditEvent={handleEditEvent}
            onDeleteEvent={(id) => deleteEvent.mutate(id)}
            onCopyLink={copyLink}
          />
        </main>
      </div>
    </>
  );
};

export default Dashboard;
