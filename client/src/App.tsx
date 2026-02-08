import { useState, useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BottomNav } from "@/components/BottomNav";
import { AnimatePresence } from "framer-motion";

import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Onboarding from "@/pages/Onboarding";
import Today from "@/pages/Today";
import Week from "@/pages/Week";
import AllTasks from "@/pages/AllTasks";
import Settings from "@/pages/Settings";
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
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-safe">
        <AnimatePresence mode="wait">
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
            <Route path="/all">
              {!isLoggedIn ? <Redirect to="/login" /> : <AllTasks />}
            </Route>
            <Route path="/settings">
              {!isLoggedIn ? <Redirect to="/login" /> : <Settings userName={userName} userEmail={userEmail} onLogout={handleLogout} />}
            </Route>
            <Route component={NotFound} />
          </Switch>
        </AnimatePresence>
        {showBottomNav && <BottomNav />}
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
