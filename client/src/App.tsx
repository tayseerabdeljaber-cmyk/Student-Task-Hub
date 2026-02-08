import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BottomNav } from "@/components/BottomNav";
import { SyncIndicator } from "@/components/SyncIndicator";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

import Landing from "@/pages/Landing";
import Today from "@/pages/Today";
import Week from "@/pages/Week";
import AllTasks from "@/pages/AllTasks";
import Settings from "@/pages/Settings";
import Activities from "@/pages/Activities";
import Schedule from "@/pages/Schedule";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/not-found";

function AuthenticatedRoutes() {
  const [location] = useLocation();
  const showBottomNav = !["/login", "/signup", "/onboarding"].includes(location);

  return (
    <>
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
    </>
  );
}

function AppContent() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-sm px-6">
          <Skeleton className="h-16 w-16 rounded-2xl mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    );
  }

  return <AuthenticatedRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground font-sans antialiased pb-safe">
        <AppContent />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
