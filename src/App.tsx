import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EventPage from "./pages/EventPage";
import Attendees from "./pages/Attendees";
import VenueSettings from "./pages/VenueSettings";
import PublicSchedule from "./pages/PublicSchedule";
import Discover from "./pages/Discover";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnalyticsProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/attendees"
                  element={
                    <ProtectedRoute>
                      <Attendees />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/settings"
                  element={
                    <ProtectedRoute>
                      <VenueSettings />
                    </ProtectedRoute>
                  }
                />
                <Route path="/discover" element={<Discover />} />
                <Route path="/e/:slug" element={<EventPage />} />
                {/* Public venue schedule — must be LAST before catch-all */}
                <Route path="/:username" element={<PublicSchedule />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnalyticsProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
