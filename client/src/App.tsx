import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BottomNav } from "@/components/BottomNav";
import { SyncIndicator } from "@/components/SyncIndicator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Today from "@/pages/Today";
import Week from "@/pages/Week";
import AllTasks from "@/pages/AllTasks";
import Settings from "@/pages/Settings";
import Activities from "@/pages/Activities";
import Schedule from "@/pages/Schedule";
import Analytics from "@/pages/Analytics";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" data-testid="loading-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading StudyFlow...</p>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const [location] = useLocation();

  useEffect(() => {
    if (!localStorage.getItem("studyStreak")) {
      localStorage.setItem("studyStreak", "5");
    }
    const darkMode = localStorage.getItem("studyflow_dark_mode") === "true";
    document.documentElement.classList.toggle("dark", darkMode);
  }, []);

  const showBottomNav = !["/login", "/signup", "/onboarding"].includes(location);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased pb-safe">
      {showBottomNav && <SyncIndicator />}
      <Switch>
        <Route path="/" component={Today} />
        <Route path="/week" component={Week} />
        <Route path="/activities" component={Activities} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/all" component={AllTasks} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Landing />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <OfflineBanner />
        <AppRouter />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
