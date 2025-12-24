import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Plus, ExternalLink, Trash2, Copy, LogOut, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import { CreateEventForm } from '@/components/CreateEventForm';
import { useAuth } from '@/hooks/useAuth';
import { useEventPages, useDeleteEventPage, eventPageToEventData, EventPage } from '@/hooks/useEventPages';
import { useToast } from '@/hooks/use-toast';
import { EventData } from '@/lib/calendar';

const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: eventPages, isLoading } = useEventPages();
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
      description: 'Share this link with your audience.',
    });
  };

  if (showForm) {
    return (
      <>
        <SEOHead title={editingEvent ? "Edit Event | CalDrop" : "Create Event | CalDrop"} />
        <div className="min-h-screen bg-background">
          <header className="border-b border-border">
            <div className="container py-4 flex items-center justify-between">
              <button onClick={() => { setShowForm(false); setEditingEvent(null); }} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">CalDrop</span>
              </button>
              <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setEditingEvent(null); }}>
                Cancel
              </Button>
            </div>
          </header>

          <main className="container py-12">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 animate-fade-up">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {editingEvent ? 'Edit Event Page' : 'Create Event Page'}
                </h1>
                <p className="text-muted-foreground">
                  {editingEvent ? 'Update your event details and styling.' : 'Set up your event and get a shareable link.'}
                </p>
              </div>
              <div className="animate-fade-up delay-100">
                <CreateEventForm 
                  onEventCreated={handleEventCreated} 
                  existingEvent={editingEvent || undefined}
                  mode={editingEvent ? 'edit' : 'create'}
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-up">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your Events</h1>
              <p className="text-muted-foreground">
                Create and manage your event pages
              </p>
            </div>
            <Button variant="glow" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" />
              New Event
            </Button>
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
                  <div className="h-6 bg-secondary rounded w-3/4 mb-3" />
                  <div className="h-4 bg-secondary rounded w-1/2 mb-4" />
                  <div className="h-8 bg-secondary rounded w-full" />
                </div>
              ))}
            </div>
          ) : eventPages && eventPages.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {eventPages.map((page, i) => (
                <div
                  key={page.id}
                  className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors animate-fade-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
                    {page.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {format(new Date(page.start_time), 'MMM d, yyyy · h:mm a')}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyLink(page.slug)}
                    >
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditEvent(page)}
                      title="Edit event"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <Link to={`/e/${page.slug}`} target="_blank">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteEvent.mutate(page.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-up">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No events yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Create your first event page to get started
              </p>
              <Button variant="glow" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Dashboard;
