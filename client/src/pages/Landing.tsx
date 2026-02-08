import { BookOpen, Calendar, Brain, BarChart3, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "AI-generated study schedules that adapt to your classes, deadlines, and personal preferences.",
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  {
    icon: Brain,
    title: "Study Recommendations",
    description: "Get personalized tips on when to start assignments, prep for exams, and balance your workload.",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Track your study habits with detailed charts showing weekly activity and course distribution.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: Clock,
    title: "Activity Management",
    description: "Organize classes, recurring activities, and events all in one place with time conflict detection.",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    icon: BookOpen,
    title: "Assignment Tracking",
    description: "Keep on top of every homework, quiz, lab, and project across all your courses and platforms.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: Zap,
    title: "Focus Mode",
    description: "Minimize distractions with a dedicated focus timer that tracks your daily study streaks.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">StudyFlow</span>
          </div>
          <Button asChild data-testid="button-login-nav">
            <a href="/api/login">Sign In</a>
          </Button>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12 lg:pt-24 lg:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight font-serif" data-testid="text-hero-title">
              Stay on top of your studies, stress-free
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              StudyFlow helps college students manage assignments, organize their schedule, 
              and build better study habits with AI-powered recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild data-testid="button-get-started">
                <a href="/api/login">Get Started</a>
              </Button>
            </div>
            <div className="flex items-center gap-4 pt-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Free forever plan</span>
              <span className="text-xs text-muted-foreground">No credit card required</span>
            </div>
          </div>

          <div className="hidden lg:block">
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-border">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Today's Tasks</p>
                    <p className="text-xs text-muted-foreground">3 due today, 2 completed</p>
                  </div>
                </div>
                {[
                  { title: "Calculus Quiz", course: "MATH 166", done: true, color: "#ef4444" },
                  { title: "Lab Report 1", course: "ENGR 132", done: false, color: "#f97316" },
                  { title: "Homework 2", course: "CS 159", done: false, color: "#3b82f6" },
                ].map((task) => (
                  <div key={task.title} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        task.done ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground/30"
                      }`}
                    >
                      {task.done && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{task.course}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.color }} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12 lg:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 font-serif" data-testid="text-features-title">
            Everything you need to ace your semester
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Built specifically for college students who want to stay organized without the overwhelm.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <Card key={f.title} className="p-5 hover-elevate" data-testid={`card-feature-${f.title.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-3`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12 lg:py-16 text-center">
        <Card className="p-8 lg:p-12 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-border">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 font-serif">
            Ready to take control of your studies?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Join students who are building better study habits and crushing their coursework.
          </p>
          <Button size="lg" asChild data-testid="button-cta-bottom">
            <a href="/api/login">Get Started for Free</a>
          </Button>
        </Card>
      </section>

      <footer className="border-t border-border py-6">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs text-muted-foreground">StudyFlow {new Date().getFullYear()}</p>
          <p className="text-xs text-muted-foreground">Built for students, by students</p>
        </div>
      </footer>
    </div>
  );
}
