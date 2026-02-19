import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Download, LogOut, Users, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SEOHead } from '@/components/SEOHead';
import { useAuth } from '@/hooks/useAuth';
import { useEventPages } from '@/hooks/useEventPages';
import { useEventRsvps } from '@/hooks/useEventRsvps';

const Attendees = () => {
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: eventPages, isLoading: eventsLoading } = useEventPages();
  const { data: rsvps, isLoading: rsvpsLoading } = useEventRsvps(selectedEventId);

  // Filter to only RSVP/waitlist events
  const rsvpEvents = useMemo(
    () => eventPages?.filter((p) => p.page_type === 'rsvp' || p.page_type === 'waitlist') || [],
    [eventPages]
  );

  // Auto-select first event if none selected
  const activeEventId = selectedEventId || rsvpEvents[0]?.id;
  const activeEvent = rsvpEvents.find((e) => e.id === activeEventId);

  // Use the active event ID for the query
  const { data: activeRsvps, isLoading: activeRsvpsLoading } = useEventRsvps(activeEventId);
  const displayRsvps = selectedEventId ? rsvps : activeRsvps;
  const displayLoading = selectedEventId ? rsvpsLoading : activeRsvpsLoading;

  const confirmedCount = displayRsvps?.filter((r) => r.status === 'confirmed').length || 0;
  const waitlistedCount = displayRsvps?.filter((r) => r.status === 'waitlisted').length || 0;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleExportCSV = () => {
    if (!displayRsvps || displayRsvps.length === 0) return;

    const headers = ['Name', 'Email', 'Status', 'Date'];
    const rows = displayRsvps.map((r) => [
      r.name,
      r.email,
      r.status,
      format(new Date(r.created_at), 'yyyy-MM-dd HH:mm'),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeEvent?.title || 'attendees'}-rsvps.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SEOHead title="Attendees | CalDrop" />
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
          {/* Back + Title */}
          <div className="flex items-center gap-3 mb-6 animate-fade-up">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Attendees</h1>
              <p className="text-muted-foreground">View and export your event RSVPs</p>
            </div>
          </div>

          {eventsLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 w-64 bg-secondary rounded" />
              <div className="h-64 bg-secondary rounded-xl" />
            </div>
          ) : rsvpEvents.length === 0 ? (
            <div className="text-center py-16 animate-fade-up">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No RSVP events yet</h2>
              <p className="text-muted-foreground mb-6">
                Create an event with the RSVP or Waitlist page type to start collecting attendees.
              </p>
              <Button variant="glow" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-up">
              {/* Event selector + export */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Select
                  value={activeEventId}
                  onValueChange={setSelectedEventId}
                >
                  <SelectTrigger className="w-full sm:w-80 bg-card border-border">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {rsvpEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={!displayRsvps || displayRsvps.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>

              {/* Stats */}
              {activeEvent && (
                <div className="flex gap-4">
                  <div className="bg-card border border-border rounded-xl px-4 py-3">
                    <p className="text-2xl font-bold text-foreground">{confirmedCount}</p>
                    <p className="text-xs text-muted-foreground">Confirmed</p>
                  </div>
                  {activeEvent.page_type === 'waitlist' && (
                    <>
                      <div className="bg-card border border-border rounded-xl px-4 py-3">
                        <p className="text-2xl font-bold text-foreground">{waitlistedCount}</p>
                        <p className="text-xs text-muted-foreground">Waitlisted</p>
                      </div>
                      {activeEvent.capacity && (
                        <div className="bg-card border border-border rounded-xl px-4 py-3">
                          <p className="text-2xl font-bold text-foreground">{activeEvent.capacity}</p>
                          <p className="text-xs text-muted-foreground">Capacity</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Table */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Name</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Email</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="px-4 py-3"><div className="h-4 w-24 bg-secondary rounded animate-pulse" /></td>
                            <td className="px-4 py-3"><div className="h-4 w-40 bg-secondary rounded animate-pulse" /></td>
                            <td className="px-4 py-3"><div className="h-4 w-16 bg-secondary rounded animate-pulse" /></td>
                            <td className="px-4 py-3"><div className="h-4 w-28 bg-secondary rounded animate-pulse" /></td>
                          </tr>
                        ))
                      ) : displayRsvps && displayRsvps.length > 0 ? (
                        displayRsvps.map((rsvp) => (
                          <tr key={rsvp.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-foreground">{rsvp.name}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{rsvp.email}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                rsvp.status === 'confirmed'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-yellow-500/10 text-yellow-600'
                              }`}>
                                {rsvp.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {format(new Date(rsvp.created_at), 'MMM d, yyyy h:mm a')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No RSVPs yet for this event.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Attendees;
