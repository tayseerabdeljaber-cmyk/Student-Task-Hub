import { BookOpen, Calendar, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Automatically organizes your assignments, classes, and study sessions into an optimized weekly plan.",
  },
  {
    icon: Zap,
    title: "Never Miss a Deadline",
    description: "Track assignments across all your platforms in one place with smart reminders before due dates.",
  },
  {
    icon: Shield,
    title: "Stay on Track",
    description: "Build study streaks, track your progress, and get personalized recommendations to boost productivity.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-50/80 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900" data-testid="text-logo">StudyFlow</span>
          </div>
          <a href="/api/login">
            <Button className="bg-indigo-500 text-white" data-testid="button-login-nav">
              Log In
            </Button>
          </a>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl text-center mb-16 transition-opacity duration-500">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 font-serif leading-tight" data-testid="text-hero-title">
            Your stress-free student planner
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-lg mx-auto" data-testid="text-hero-subtitle">
            Track assignments, schedule study sessions, and never miss a deadline again. Built for students who want to stay organized.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/api/login">
              <Button size="lg" className="bg-indigo-500 text-white text-base px-8" data-testid="button-get-started">
                Get Started
              </Button>
            </a>
          </div>
          <p className="text-sm text-slate-400 mt-4">Free to use. No credit card required.</p>
        </div>

        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6 rounded-2xl bg-white border-slate-100" data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-100 py-6 text-center">
        <p className="text-sm text-slate-400">StudyFlow &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
