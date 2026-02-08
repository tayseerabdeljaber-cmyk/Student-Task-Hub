import { useState, useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BottomNav } from "@/components/BottomNav";
import { SyncIndicator } from "@/components/SyncIndicator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";

import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Onboarding from "@/pages/Onboarding";
import Today from "@/pages/Today";
import Week from "@/pages/Week";
import AllTasks from "@/pages/AllTasks";
import Settings from "@/pages/Settings";
import Activities from "@/pages/Activities";
import Schedule from "@/pages/Schedule";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/not-found";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("studyflow_logged_in") === "true";
  });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("studyflow_name") || "Student";
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem("studyflow_email") || "";
  });
  const [location] = useLocation();

  useEffect(() => {
    if (!localStorage.getItem("studyStreak")) {
      localStorage.setItem("studyStreak", "5");
    }
    const darkMode = localStorage.getItem("studyflow_dark_mode") === "true";
    document.documentElement.classList.toggle("dark", darkMode);
  }, []);

  const handleLogin = (email: string) => {
    localStorage.setItem("studyflow_logged_in", "true");
    localStorage.setItem("studyflow_email", email);
    const name = email.split("@")[0];
    localStorage.setItem("studyflow_name", name);
    setIsLoggedIn(true);
    setUserEmail(email);
    setUserName(name);
  };

  const handleSignup = (name: string, email: string) => {
    localStorage.setItem("studyflow_logged_in", "true");
    localStorage.setItem("studyflow_name", name);
    localStorage.setItem("studyflow_email", email);
    setIsLoggedIn(true);
    setUserName(name);
    setUserEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem("studyflow_logged_in");
    localStorage.removeItem("studyflow_name");
    localStorage.removeItem("studyflow_email");
    setIsLoggedIn(false);
    setUserName("Student");
    setUserEmail("");
  };

  const showBottomNav = isLoggedIn && !["/login", "/signup", "/onboarding"].includes(location);

  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <OfflineBanner />
      <div className="min-h-screen bg-background text-foreground font-sans antialiased pb-safe">
        {showBottomNav && <SyncIndicator />}
        <Switch>
          <Route path="/login">
            {isLoggedIn ? <Redirect to="/" /> : <Login onLogin={handleLogin} />}
          </Route>
          <Route path="/signup">
            {isLoggedIn ? <Redirect to="/" /> : <Signup onSignup={handleSignup} />}
          </Route>
          <Route path="/onboarding">
            {!isLoggedIn ? <Redirect to="/login" /> : <Onboarding />}
          </Route>
          <Route path="/">
            {!isLoggedIn ? <Redirect to="/login" /> : <Today />}
          </Route>
          <Route path="/week">
            {!isLoggedIn ? <Redirect to="/login" /> : <Week />}
          </Route>
          <Route path="/activities">
            {!isLoggedIn ? <Redirect to="/login" /> : <Activities />}
          </Route>
          <Route path="/schedule">
            {!isLoggedIn ? <Redirect to="/login" /> : <Schedule />}
          </Route>
          <Route path="/all">
            {!isLoggedIn ? <Redirect to="/login" /> : <AllTasks />}
          </Route>
          <Route path="/analytics">
            {!isLoggedIn ? <Redirect to="/login" /> : <Analytics />}
          </Route>
          <Route path="/settings">
            {!isLoggedIn ? <Redirect to="/login" /> : <Settings userName={userName} userEmail={userEmail} onLogout={handleLogout} />}
          </Route>
          <Route component={NotFound} />
        </Switch>
        {showBottomNav && <BottomNav />}
        <Toaster />
      </div>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
