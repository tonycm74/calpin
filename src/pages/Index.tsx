import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Zap, Smartphone, Bell, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateEventForm } from "@/components/CreateEventForm";
import { EventCard } from "@/components/EventCard";
import { SEOHead } from "@/components/SEOHead";
import { EventData } from "@/lib/calendar";

const Index = () => {
  const [createdEvent, setCreatedEvent] = useState<EventData | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleEventCreated = (event: EventData) => {
    setCreatedEvent(event);
    setShowForm(false);
  };

  // Preview mode - show created event
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
                <span className="text-sm font-medium text-primary">Event Page Created!</span>
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Here's how your visitors will see it
              </h2>
            </div>

            <div className="max-w-md mx-auto animate-fade-up delay-100">
              <EventCard event={createdEvent} />
            </div>

            {/* Share Link */}
            <div className="max-w-md mx-auto mt-8 animate-fade-up delay-200">
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-sm font-medium text-foreground mb-2">Share this link</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm text-muted-foreground truncate">
                    caldrop.app/e/{createdEvent.slug}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://caldrop.app/e/${createdEvent.slug}`);
                    }}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                </div>
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
            </div>
          </header>

          {/* Form Content */}
          <main className="container py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-8 animate-fade-up">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Create Event Page
                </h1>
                <p className="text-muted-foreground">
                  Set up your event and get a shareable link with calendar buttons.
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
      <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b border-border relative z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">CalDrop</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="container relative z-10">
        <div className="py-20 md:py-32 text-center max-w-3xl mx-auto">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Simple event sharing
              </span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-up delay-100">
            Drop events into{" "}
            <span className="text-gradient">any calendar</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto animate-fade-up delay-200">
            Create beautiful, mobile-first landing pages that let anyone add your
            events to their calendar with one tap.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
            <Button
              variant="glow"
              size="xl"
              onClick={() => setShowForm(true)}
            >
              Create Event Page
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg">
              See Example
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="pb-20 md:pb-32">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Smartphone,
                title: "Mobile-First",
                description:
                  "Clean, minimal pages designed for tapping on any device.",
              },
              {
                icon: Bell,
                title: "Smart Reminders",
                description:
                  "Events include built-in reminders so no one misses a thing.",
              },
              {
                icon: LinkIcon,
                title: "Universal Links",
                description:
                  "Works with Google, Apple, and Outlook calendars instantly.",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`bg-card rounded-2xl border border-border p-6 animate-fade-up`}
                style={{ animationDelay: `${400 + i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
    </>
  );
};

export default Index;
