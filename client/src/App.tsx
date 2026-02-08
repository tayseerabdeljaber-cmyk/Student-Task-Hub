import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BottomNav } from "@/components/BottomNav";

// Pages
import Today from "@/pages/Today";
import Week from "@/pages/Week";
import AllTasks from "@/pages/AllTasks";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Today} />
      <Route path="/week" component={Week} />
      <Route path="/all" component={AllTasks} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-primary/20 pb-safe">
        <Router />
        <BottomNav />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
