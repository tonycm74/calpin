import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, ArrowRight, Zap, Smartphone, Bell, Link as LinkIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateEventForm } from "@/components/CreateEventForm";
import { EventCard } from "@/components/EventCard";
import { SEOHead } from "@/components/SEOHead";
import { EventData } from "@/lib/calendar";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [createdEvent, setCreatedEvent] = useState<EventData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleEventCreated = (event?: EventData) => {
    if (event) {
      setCreatedEvent(event);
    }
    setShowForm(false);
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth?mode=signup');
    }
  };

  // Preview mode - show created event (for non-logged in users)
  if (createdEvent) {
    return (
      <>
        <SEOHead title={`${createdEvent.title} | CalDrop`} />
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCreatedEvent(null);
                  setShowForm(true);
                }}
              >
                Create Another
              </Button>
            </div>
          </header>

          {/* Preview Content */}
          <main className="container py-12">
            <div className="text-center mb-8 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Preview Mode</span>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Here's how your visitors will see it
              </h2>
              <p className="text-sm text-muted-foreground">
                <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to save and share your events
              </p>
            </div>

            <div className="max-w-md mx-auto animate-fade-up delay-100">
              <EventCard event={createdEvent} />
            </div>

            {/* Share Link */}
            <div className="max-w-md mx-auto mt-8 animate-fade-up delay-200">
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-sm font-medium text-foreground mb-2">Want to share this?</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Sign in to save your event and get a shareable link.
                </p>
                <Button variant="glow" size="sm" asChild>
                  <Link to="/auth">
                    <User className="w-4 h-4" />
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  // Form mode
  if (showForm) {
    return (
      <>
        <SEOHead title="Create Event Page | CalDrop" />
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="border-b border-border">
            <div className="container py-4 flex items-center justify-between">
              <button
                onClick={() => setShowForm(false)}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">CalDrop</span>
              </button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          </header>

          {/* Form Content */}
          <main className="container py-12">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 animate-fade-up">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Create Event Page
                </h1>
                <p className="text-muted-foreground">
                  Set up your event and preview the calendar buttons.
                </p>
              </div>

              <div className="animate-fade-up delay-100">
                <CreateEventForm onEventCreated={handleEventCreated} />
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  // Landing page
  return (
    <>
      <SEOHead />
      <div className="min-h-screen bg-background overflow-hidden relative">
        {/* Mesh gradient background */}
        <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
        
        {/* Animated orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-3s' }} />
        </div>

        {/* Header */}
        <header className="border-b border-border/50 relative z-10 backdrop-blur-sm bg-background/50">
          <div className="container py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground tracking-tight">CalDrop</span>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10" onClick={handleGetStarted}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero */}
        <main className="container relative z-10">
          <div className="py-24 md:py-36 text-center max-w-4xl mx-auto">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-foreground/80">
                  Simple event sharing
                </span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-[1.1] mb-8 animate-fade-up delay-100 tracking-tight">
              Drop events into{" "}
              <span className="text-gradient">any calendar</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-up delay-200 leading-relaxed">
              Create beautiful, mobile-first landing pages that let anyone add your
              events to their calendar with one tap.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
              <Button
                variant="glow"
                size="xl"
                onClick={handleGetStarted}
                className="group"
              >
                {user ? 'Go to Dashboard' : 'Create Event Page'}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="border-border hover:border-primary/50 hover:bg-primary/5" asChild>
                <Link to="/auth?mode=signup">Try It Free</Link>
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="pb-24 md:pb-36">
            <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {[
                {
                  icon: Smartphone,
                  title: "Mobile-First",
                  description:
                    "Clean, minimal pages designed for tapping on any device.",
                  gradient: "from-primary/20 to-primary/5",
                },
                {
                  icon: Bell,
                  title: "Smart Reminders",
                  description:
                    "Events include built-in reminders so no one misses a thing.",
                  gradient: "from-accent/20 to-accent/5",
                },
                {
                  icon: LinkIcon,
                  title: "Universal Links",
                  description:
                    "Works with Google, Apple, and Outlook calendars instantly.",
                  gradient: "from-primary/20 to-accent/5",
                },
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className="group relative bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-7 animate-fade-up hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                  style={{ animationDelay: `${400 + i * 100}ms` }}
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 border border-border/50 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;
