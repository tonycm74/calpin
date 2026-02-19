import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, LogOut, Save, Loader2, ExternalLink, Copy, Check, Phone, Globe, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SEOHead } from '@/components/SEOHead';
import { ImageUpload } from '@/components/ImageUpload';
import { PlacesAutocomplete, PlaceResult } from '@/components/PlacesAutocomplete';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

const VenueSettings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const [username, setUsername] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueDescription, setVenueDescription] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venuePhone, setVenuePhone] = useState('');
  const [venueWebsite, setVenueWebsite] = useState('');
  const [venueImageUrl, setVenueImageUrl] = useState('');
  const [venueImages, setVenueImages] = useState<string[]>([]);
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [availablePhotos, setAvailablePhotos] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setVenueName(profile.venue_name || '');
      setVenueDescription(profile.venue_description || '');
      setVenueAddress(profile.venue_address || '');
      setVenuePhone(profile.venue_phone || '');
      setVenueWebsite(profile.venue_website || '');
      setVenueImageUrl(profile.venue_image_url || '');
      setVenueImages(profile.venue_images || []);
      setGooglePlaceId(profile.google_place_id || '');
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSave = async () => {
    const slug = username
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!slug) {
      toast({
        title: 'Username required',
        description: 'Please enter a URL-friendly username for your venue.',
        variant: 'destructive',
      });
      return;
    }

    await updateProfile.mutateAsync({
      username: slug,
      venue_name: venueName || null,
      venue_description: venueDescription || null,
      venue_address: venueAddress || null,
      venue_phone: venuePhone || null,
      venue_website: venueWebsite || null,
      venue_image_url: venueImageUrl || null,
      venue_images: venueImages.length > 0 ? venueImages : null,
      google_place_id: googlePlaceId || null,
    });
  };

  const handlePlaceSelected = (place: PlaceResult) => {
    setVenueName(place.name);
    setVenueAddress(place.address);
    setGooglePlaceId(place.place_id);
    if (place.phone) setVenuePhone(place.phone);
    if (place.website) setVenueWebsite(place.website);

    // Show all available photos for selection
    if (place.photo_urls.length > 0) {
      setAvailablePhotos(place.photo_urls);
      // Auto-select the first as cover image
      setVenueImageUrl(place.photo_urls[0]);
      setVenueImages(place.photo_urls);
    }

    // Auto-generate username from venue name if empty
    if (!username && place.name) {
      const slug = place.name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setUsername(slug);
    }

    toast({
      title: 'Venue found!',
      description: place.photo_urls.length > 0
        ? `We found ${place.photo_urls.length} photos. Select the ones you want to use.`
        : 'We filled in your details from Google Maps. Review and save.',
    });
  };

  const togglePhoto = (url: string) => {
    setVenueImages((prev) => {
      if (prev.includes(url)) {
        const updated = prev.filter((u) => u !== url);
        // If we removed the cover image, set the next one as cover
        if (url === venueImageUrl && updated.length > 0) {
          setVenueImageUrl(updated[0]);
        } else if (updated.length === 0) {
          setVenueImageUrl('');
        }
        return updated;
      }
      return [...prev, url];
    });
  };

  const setCoverImage = (url: string) => {
    setVenueImageUrl(url);
    // Make sure it's also in the selected images
    if (!venueImages.includes(url)) {
      setVenueImages((prev) => [url, ...prev]);
    }
  };

  const publicUrl = username ? `${window.location.origin}/${username}` : '';

  const handleCopy = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast({ title: 'Link copied!' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Venue Settings | CalDrop" />
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

        <main className="container py-8 max-w-2xl">
          {/* Back + Title */}
          <div className="flex items-center gap-3 mb-8 animate-fade-up">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Venue Settings</h1>
              <p className="text-muted-foreground">Set up your venue's public profile</p>
            </div>
          </div>

          <div className="space-y-8 animate-fade-up">
            {/* Public URL */}
            <div className="bg-card border border-border rounded-xl p-6">
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Your Public URL
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-background border border-border rounded-lg overflow-hidden">
                  <span className="text-sm text-muted-foreground px-3 py-2 border-r border-border bg-secondary/30">
                    caldrop.com/
                  </span>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your-venue"
                    className="border-0 focus-visible:ring-0 rounded-none"
                  />
                </div>
              </div>
              {publicUrl && profile?.username && (
                <div className="flex items-center gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/${profile.username}`}>
                      <ExternalLink className="w-3 h-3" />
                      Preview
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Google Places Lookup */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Find Your Venue</h2>
              <p className="text-sm text-muted-foreground">
                Search Google Maps to auto-fill your venue details, photos, and more.
              </p>
              <PlacesAutocomplete onPlaceSelected={handlePlaceSelected} />
            </div>

            {/* Venue Details */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Venue Details</h2>

              <div className="space-y-2">
                <Label htmlFor="venue-name">Venue Name</Label>
                <Input
                  id="venue-name"
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="The Local Tap Room"
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue-description">Description</Label>
                <Textarea
                  id="venue-description"
                  value={venueDescription}
                  onChange={(e) => setVenueDescription(e.target.value)}
                  placeholder="Your neighborhood bar with weekly events..."
                  className="bg-background border-border resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue-address">Address</Label>
                <Input
                  id="venue-address"
                  type="text"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  placeholder="123 Main St, Patchogue, NY"
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue-phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="venue-phone"
                    type="tel"
                    value={venuePhone}
                    onChange={(e) => setVenuePhone(e.target.value)}
                    placeholder="(631) 555-1234"
                    className="bg-background border-border pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue-website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="venue-website"
                    type="url"
                    value={venueWebsite}
                    onChange={(e) => setVenueWebsite(e.target.value)}
                    placeholder="https://www.yourvenue.com"
                    className="bg-background border-border pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cover Image</Label>
                <ImageUpload
                  value={venueImageUrl}
                  onChange={setVenueImageUrl}
                />
              </div>
            </div>

            {/* Photo Gallery Picker */}
            {availablePhotos.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Google Photos
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {venueImages.length} of {availablePhotos.length} selected. Click to toggle. Right-click or long-press to set as cover.
                    </p>
                  </div>
                  {venueImages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setVenueImages([]); setVenueImageUrl(''); }}
                      className="text-muted-foreground"
                    >
                      <X className="w-4 h-4" />
                      Clear All
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availablePhotos.map((url, i) => {
                    const isSelected = venueImages.includes(url);
                    const isCover = url === venueImageUrl;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => togglePhoto(url)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setCoverImage(url);
                          toast({ title: 'Cover image set!' });
                        }}
                        className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border opacity-50 hover:opacity-80'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Venue photo ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {isCover && (
                          <span className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                            COVER
                          </span>
                        )}
                        {isSelected && !isCover && (
                          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Save Button */}
            <Button
              variant="glow"
              size="lg"
              className="w-full"
              onClick={handleSave}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Venue Settings
                </>
              )}
            </Button>
          </div>
        </main>
      </div>
    </>
  );
};

export default VenueSettings;
