import { useState, FormEvent } from "react";
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
  Check,
  Sparkles,
  Repeat,
  Beer,
  Mic2,
  Music,
  UtensilsCrossed,
  Search,
  Compass,
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
  const [discoverQuery, setDiscoverQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDiscover = (e: FormEvent) => {
    e.preventDefault();
    if (discoverQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(discoverQuery.trim())}`);
    } else {
      navigate('/discover');
    }
  };

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
    title: "Tuesday Trivia Night",
    description: "Teams of up to 6. Prizes for top 3.\nFree to play — just grab a drink!",
    startTime: new Date(2026, 2, 24, 19, 0),
    endTime: new Date(2026, 2, 24, 21, 0),
    location: "The Local Tap Room",
    imageUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&auto=format&fit=crop&q=60",
    slug: "tuesday-trivia",
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
                Here's how your patrons will see it
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
        <SEOHead title="Add Event | CalDrop" />
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
              <span className="text-xl font-semibold text-foreground tracking-tight">CalDrop</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link to="/discover">
                  <Compass className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Explore</span>
                </Link>
              </Button>
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
                  Built for bars, restaurants & venues
                </span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-foreground leading-[1.1] mb-6 animate-fade-up delay-100 tracking-tight">
              Your venue's events,
              <br />
              <span className="text-gradient">in every calendar</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-2xl mx-auto animate-fade-up delay-200 leading-relaxed">
              Publish your weekly schedule — trivia, karaoke, live music, happy hour — and
              let your regulars subscribe with one tap. They'll never miss a night.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
              <Button
                variant="glow"
                size="xl"
                onClick={user ? handleGetStarted : () => setShowForm(true)}
                className="group"
              >
                {user ? 'Go to Dashboard' : 'Set Up Your Venue'}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="border-border hover:border-primary/50 hover:bg-primary/5" asChild>
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>

            {/* Discover search bar */}
            <form onSubmit={handleDiscover} className="mt-10 max-w-md mx-auto animate-fade-up delay-400">
              <p className="text-sm text-muted-foreground mb-3">Or find events near you</p>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={discoverQuery}
                  onChange={(e) => setDiscoverQuery(e.target.value)}
                  placeholder="Search a town or city..."
                  className="w-full pl-11 pr-24 py-3 rounded-xl bg-background/80 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 backdrop-blur-sm"
                />
                <Button
                  type="submit"
                  variant="glow"
                  size="sm"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2"
                >
                  Explore
                </Button>
              </div>
            </form>
          </section>

          {/* ============================================ */}
          {/* BUILT FOR VENUES */}
          {/* ============================================ */}
          <section className="py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">
                Built for Venues
              </h2>
              <p className="text-lg text-foreground/80 leading-relaxed mb-8">
                Your bar runs trivia every Tuesday and karaoke every Friday — but your regulars keep forgetting.
                CalDrop gives your venue a <span className="text-foreground font-semibold">subscribable event calendar</span> that
                drops your schedule right into their phone. When you add a new event, it shows up automatically.
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
                  title: "Add Your Events",
                  description: "Trivia night, karaoke, live music, happy hour — add them once and set them to repeat weekly. Done.",
                  color: "primary",
                },
                {
                  step: "02",
                  icon: Share2,
                  title: "Share Your Schedule",
                  description: "Get a public page for your venue. Drop the link in your Instagram bio, print a QR code for the bar, or add it to your website.",
                  color: "accent",
                },
                {
                  step: "03",
                  icon: MousePointerClick,
                  title: "Patrons Subscribe",
                  description: "One tap and your full schedule lands in their Google, Apple, or Outlook calendar. New events sync automatically.",
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
                    Every event gets a clean, mobile-first page your patrons can tap to add it
                    to their calendar. Reminders included — so they actually show up.
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Recurring events — set it and forget it",
                      "RSVP collection to know who's coming",
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
          {/* WHY CALDROP? */}
          {/* ============================================ */}
          <section className="py-16 md:py-24">
            <div className="text-center mb-16 animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
                Why CalDrop?
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Stop relying on Instagram stories and paper flyers. Here's why venues love CalDrop.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {[
                {
                  icon: Bell,
                  title: "Automatic Reminders",
                  description: "Patrons get reminded before trivia night, karaoke, or happy hour. They show up — not forget.",
                  gradient: "from-accent/20 to-accent/5",
                },
                {
                  icon: Repeat,
                  title: "Recurring Events",
                  description: "Set trivia to repeat every Tuesday. Set karaoke for every Friday. CalDrop generates every occurrence.",
                  gradient: "from-primary/20 to-primary/5",
                },
                {
                  icon: LinkIcon,
                  title: "Subscribable Calendar",
                  description: "Patrons subscribe once and your full schedule auto-syncs. When you add events, they appear automatically.",
                  gradient: "from-primary/20 to-accent/5",
                },
                {
                  icon: Share2,
                  title: "Shareable Anywhere",
                  description: "Instagram bio, QR code at the bar, your website, Google Maps listing — put your link wherever your patrons are.",
                  gradient: "from-accent/20 to-primary/5",
                },
                {
                  icon: Users,
                  title: "RSVP & Headcounts",
                  description: "Collect RSVPs to know how many people are coming. Export attendee lists anytime.",
                  gradient: "from-primary/20 to-primary/5",
                },
                {
                  icon: Smartphone,
                  title: "No App Required",
                  description: "Your patrons don't need to download anything. Just tap and it's in their calendar. Done.",
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
          {/* PERFECT FOR */}
          {/* ============================================ */}
          <section className="py-16 md:py-24">
            <div className="text-center mb-16 animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
                Perfect For
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Any venue that runs regular events and wants more people to show up.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                {
                  icon: Beer,
                  title: "Bars & Pubs",
                  examples: "Trivia, karaoke, open mic, DJ nights",
                },
                {
                  icon: UtensilsCrossed,
                  title: "Restaurants",
                  examples: "Brunch, wine nights, themed dinners",
                },
                {
                  icon: Music,
                  title: "Breweries & Taprooms",
                  examples: "Live music, food trucks, tastings",
                },
                {
                  icon: Mic2,
                  title: "Event Venues",
                  examples: "Comedy, bingo, sports watch parties",
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
                    Ready to fill your venue?
                  </h2>
                  <p className="text-lg text-foreground/70 mb-8 max-w-xl mx-auto">
                    It's free to get started. Set up your venue's calendar in under a minute.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                      variant="glow"
                      size="xl"
                      onClick={user ? handleGetStarted : () => setShowForm(true)}
                      className="group"
                    >
                      Set Up Your Venue
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
                <span className="font-medium text-foreground">CalDrop</span>
              </div>
              <p>&copy; {new Date().getFullYear()} CalDrop. Your venue's events, in every calendar.</p>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
};

export default Index;
