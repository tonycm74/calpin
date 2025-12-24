import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  ArrowRight, 
  Zap, 
  Smartphone, 
  Bell, 
  Link as LinkIcon, 
  User,
  Share2,
  MousePointerClick,
  CalendarPlus,
  Users,
  Megaphone,
  PartyPopper,
  Music,
  Video,
  Check,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateEventWizard } from "@/components/CreateEventWizard";
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

  // Demo event for the preview
  const demoEvent: EventData = {
    id: "demo",
    title: "Summer Music Festival 2025",
    description: "Join us for an unforgettable weekend of\nlive music, food, and fun!",
    startTime: new Date(2025, 6, 15, 14, 0),
    endTime: new Date(2025, 6, 15, 22, 0),
    location: "https://tickets.example.com",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=60",
    slug: "summer-fest-2025",
    reminderMinutes: [60, 1440],
    uiSchema: {
      textAlign: 'center',
      showDescription: true,
      imageSize: 'medium',
      buttonStyle: 'default',
      imagePosition: 'top',
    },
  };

  // Preview mode - show created event (for non-logged in users)
  if (createdEvent) {
    return (
      <>
        <SEOHead title={`${createdEvent.title} | CalPing`} />
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="border-b border-border">
            <div className="container py-4 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">CalPing</span>
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

  // Form mode (wizard)
  if (showForm) {
    return (
      <>
        <SEOHead title="Create Event Page | CalPing" />
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
                <span className="text-lg font-bold text-foreground">CalPing</span>
              </button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          </header>

          {/* Wizard Content */}
          <main className="container py-12">
            <div className="max-w-5xl mx-auto">
              <div className="animate-fade-up">
                <CreateEventWizard 
                  onEventCreated={handleEventCreated} 
                  onCancel={() => setShowForm(false)}
                />
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
        <header className="border-b border-border/50 relative z-10 backdrop-blur-sm bg-background/50 sticky top-0">
          <div className="container py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground tracking-tight">CalPing</span>
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

        <main className="container relative z-10">
          {/* ============================================ */}
          {/* HERO SECTION */}
          {/* ============================================ */}
          <section className="py-20 md:py-32 text-center max-w-4xl mx-auto">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-foreground/80">
                  The simplest way to share events
                </span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-foreground leading-[1.1] mb-6 animate-fade-up delay-100 tracking-tight">
              Share your events into
              <br />
              <span className="text-gradient">any calendar</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-2xl mx-auto animate-fade-up delay-200 leading-relaxed">
              Create a shareable link. Anyone who clicks it can add your event to their 
              Google, Apple, or Outlook calendar with one tap. No app needed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
              <Button
                variant="glow"
                size="xl"
                onClick={user ? handleGetStarted : () => setShowForm(true)}
                className="group"
              >
                {user ? 'Go to Dashboard' : 'Create Your First Event'}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="border-border hover:border-primary/50 hover:bg-primary/5" asChild>
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
          </section>

          {/* ============================================ */}
          {/* WHAT IS CALPING? */}
          {/* ============================================ */}
          <section className="py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
                What is CalPing?
              </h2>
              <p className="text-lg text-foreground/80 leading-relaxed mb-8">
                CalPing turns any event into a <span className="text-foreground font-semibold">beautiful, mobile-first landing page</span> with 
                calendar buttons built in. Share the link, and your audience can add your event 
                to their calendar in seconds — complete with reminders so they never miss it.
              </p>
              <div className="inline-flex items-center gap-4 px-5 py-3 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3">
                  {/* Google Calendar */}
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/2048px-Google_Calendar_icon_%282020%29.svg.png" 
                    alt="Google Calendar" 
                    className="w-7 h-7 object-contain"
                  />
                  {/* Apple Calendar */}
                  <img 
                    src="https://cdn.jim-nielsen.com/macos/512/calendar-2021-04-29.png?rf=1024" 
                    alt="Apple Calendar" 
                    className="w-7 h-7 object-contain"
                  />
                  {/* Outlook Calendar */}
                  <img 
                    src="https://cdn.prod.website-files.com/5f196ad93510ee0712a58d15/6346f24b925ee304ff41965c_Outlook.com_icon_(2012-2019).svg.png" 
                    alt="Outlook Calendar" 
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <span className="text-sm text-foreground/80">Works with every major calendar</span>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* HOW IT WORKS */}
          {/* ============================================ */}
          <section id="how-it-works" className="py-16 md:py-24 scroll-mt-20">
            <div className="text-center mb-16 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">3 Simple Steps</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                How It Works
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  step: "01",
                  icon: CalendarPlus,
                  title: "Create Your Event",
                  description: "Add your event details — title, date, time, description, and an optional image. Customize the look and feel.",
                  color: "primary",
                },
                {
                  step: "02",
                  icon: Share2,
                  title: "Share the Link",
                  description: "Get a custom URL for your event page. Share it in emails, social, or anywhere your audience is.",
                  color: "accent",
                },
                {
                  step: "03",
                  icon: MousePointerClick,
                  title: "They Tap, It's Added",
                  description: "Visitors tap one button to add your event to their calendar. Reminders are included automatically.",
                  color: "primary",
                },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className="group relative animate-fade-up"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8 h-full hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    {/* Step number */}
                    <div className="text-6xl font-bold text-gradient opacity-20 mb-4">
                      {item.step}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl bg-${item.color}/10 border border-${item.color}/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                      <item.icon className={`w-7 h-7 text-${item.color}`} />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-foreground/70 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ============================================ */}
          {/* LIVE DEMO PREVIEW */}
          {/* ============================================ */}
          <section className="py-16 md:py-24">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Text content */}
                <div className="animate-fade-up">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">See It In Action</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
                    Beautiful event pages,<br />
                    ready to share
                  </h2>
                  <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                    Every CalPing page is mobile-optimized and looks great on any device. 
                    Your visitors get a clean, focused experience with one clear action: 
                    add to calendar.
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Custom images and styling options",
                      "Track views and calendar adds",
                      "Works on every device and browser",
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Demo card */}
                <div className="animate-fade-up delay-200">
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl -z-10" />
                    <EventCard event={demoEvent} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* WHY USE CALPING? */}
          {/* ============================================ */}
          <section className="py-16 md:py-24">
            <div className="text-center mb-16 animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
                Why Use CalPing?
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Stop losing attendees to forgotten events. Here's why CalPing works better.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {[
                {
                  icon: Smartphone,
                  title: "Mobile-First Design",
                  description: "Clean, tap-friendly pages designed for how people actually use their phones.",
                  gradient: "from-primary/20 to-primary/5",
                },
                {
                  icon: Bell,
                  title: "Automatic Reminders",
                  description: "Every calendar add includes reminders, so your audience shows up — not forgets.",
                  gradient: "from-accent/20 to-accent/5",
                },
                {
                  icon: LinkIcon,
                  title: "One Link, All Calendars",
                  description: "Works with Google Calendar, Apple Calendar, Outlook, and more. No compatibility issues.",
                  gradient: "from-primary/20 to-accent/5",
                },
                {
                  icon: Share2,
                  title: "Shareable Anywhere",
                  description: "Drop your link in Instagram bio, Twitter, email, Slack, Discord — wherever your people are.",
                  gradient: "from-accent/20 to-primary/5",
                },
                {
                  icon: Zap,
                  title: "No App Required",
                  description: "Your audience doesn't need to download anything. Just tap and add. It's that simple.",
                  gradient: "from-primary/20 to-primary/5",
                },
                {
                  icon: Users,
                  title: "Track Engagement",
                  description: "See how many people viewed your page and added your event to their calendar.",
                  gradient: "from-accent/20 to-accent/5",
                },
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className="group relative bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-7 animate-fade-up hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 border border-border/50 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-foreground/70 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ============================================ */}
          {/* USE CASES */}
          {/* ============================================ */}
          <section className="py-16 md:py-24">
            <div className="text-center mb-16 animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
                Perfect For
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Anyone who needs people to show up. Here are some popular use cases.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                {
                  icon: Megaphone,
                  title: "Event Organizers",
                  examples: "Conferences, meetups, workshops",
                },
                {
                  icon: Video,
                  title: "Creators",
                  examples: "Livestreams, premieres, drops",
                },
                {
                  icon: Music,
                  title: "Musicians & DJs",
                  examples: "Shows, tours, album releases",
                },
                {
                  icon: PartyPopper,
                  title: "Personal Events",
                  examples: "Weddings, parties, reunions",
                },
              ].map((useCase, i) => (
                <div
                  key={useCase.title}
                  className="bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50 p-6 text-center animate-fade-up hover:bg-card/50 transition-colors"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <useCase.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{useCase.title}</h3>
                  <p className="text-sm text-foreground/60">{useCase.examples}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ============================================ */}
          {/* FINAL CTA */}
          {/* ============================================ */}
          <section className="py-20 md:py-32">
            <div className="max-w-3xl mx-auto text-center animate-fade-up">
              <div className="relative">
                {/* Background glow */}
                <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl -z-10" />
                
                <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 p-10 md:p-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
                    Ready to ping your first event?
                  </h2>
                  <p className="text-lg text-foreground/70 mb-8 max-w-xl mx-auto">
                    It's free to get started. Create your event page in under a minute.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                      variant="glow"
                      size="xl"
                      onClick={user ? handleGetStarted : () => setShowForm(true)}
                      className="group"
                    >
                      Create Event Page
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                    {!user && (
                      <Button variant="outline" size="lg" className="border-border hover:border-primary/50" asChild>
                        <Link to="/auth?mode=signup">Sign Up Free</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* FOOTER */}
          {/* ============================================ */}
          <footer className="py-12 border-t border-border/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium text-foreground">CalPing</span>
              </div>
              <p>© {new Date().getFullYear()} CalPing. Drop events into any calendar.</p>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
};

export default Index;
