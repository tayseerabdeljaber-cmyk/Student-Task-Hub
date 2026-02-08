import { useState } from "react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { useAssignments } from "@/hooks/use-assignments";
import { useScheduleBlocks } from "@/hooks/use-activities";
import { useRecommendations } from "@/hooks/use-recommendations";
import { useSubscription } from "@/hooks/use-preferences";
import { TaskCard } from "@/components/TaskCard";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { PremiumModal } from "@/components/PremiumModal";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2, Flame, Sparkles, Focus, X, PartyPopper,
  Lightbulb, ChevronRight, Star, ArrowRight, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AssignmentWithCourse } from "@shared/schema";

export default function Today() {
  const { data: assignments, isLoading } = useAssignments();
  const { data: scheduleBlocks } = useScheduleBlocks();
  const [, setLocation] = useLocation();
  const [focusMode, setFocusMode] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AssignmentWithCourse | null>(null);
  const [dismissedRecs, setDismissedRecs] = useState<Set<string>>(new Set());
  const recommendations = useRecommendations(assignments, scheduleBlocks);
  const sub = useSubscription();

  const streak = Number(localStorage.getItem("studyStreak") || "5");
  const visibleRecs = recommendations.filter(r => !dismissedRecs.has(r.id));

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const todaysTasks = assignments?.filter(task => {
    const due = new Date(task.dueDate);
    return due >= todayStart && due <= todayEnd && !task.completed;
  }) || [];

  const completedToday = assignments?.filter(task => {
    const due = new Date(task.dueDate);
    return due >= todayStart && due <= todayEnd && task.completed;
  }) || [];

  const upcomingTasks = assignments?.filter(task => {
    const due = new Date(task.dueDate);
    return due > todayEnd && !task.completed;
  }).slice(0, 3) || [];

  const allTodayDone = todaysTasks.length === 0 && completedToday.length > 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 17) return "Good afternoon!";
    return "Good evening!";
  };

  const nextDueTask = todaysTasks.length > 0
    ? todaysTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]
    : upcomingTasks[0];

  return (
    <div className="pb-24 px-4 pt-8 max-w-md mx-auto min-h-screen bg-background">
      {/* Header */}
      <header className="mb-8">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1" data-testid="text-date">
          {format(new Date(), "EEEE, MMMM d")}
        </p>
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-greeting">
            {getGreeting()}
          </h1>
          <div className="flex items-center gap-2">
            {/* Streak */}
            <div className="flex items-center gap-1 bg-orange-50 px-2.5 py-1.5 rounded-full border border-orange-100" data-testid="badge-streak">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-orange-600">{streak}</span>
            </div>
            {/* Notifications */}
            <NotificationsDropdown />
          </div>
        </div>
      </header>

      {/* Focus Mode Toggle, Premium & Insights */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Button
          variant="outline"
          onClick={() => setFocusMode(!focusMode)}
          className={`rounded-full text-xs font-semibold gap-1.5 ${focusMode ? "bg-indigo-50 border-indigo-200 text-indigo-600" : ""}`}
          data-testid="button-focus-mode"
        >
          {focusMode ? <X className="w-3.5 h-3.5" /> : <Focus className="w-3.5 h-3.5" />}
          {focusMode ? "Exit Focus" : "Focus Mode"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setPremiumOpen(true)}
          className="rounded-full text-xs font-semibold gap-1.5"
          data-testid="button-study-plan"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          Study Plan
        </Button>
        <Button
          variant="outline"
          onClick={() => setLocation("/analytics")}
          className="rounded-full text-xs font-semibold gap-1.5"
          data-testid="button-insights"
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          Insights
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {focusMode ? (
          /* Focus Mode - show only next task */
          <motion.div
            key="focus"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="mb-4">
              <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-1">Focus: Next Task</h2>
              <p className="text-xs text-slate-400">Complete this, then move on.</p>
            </div>
            {nextDueTask ? (
              <TaskCard assignment={nextDueTask} onTap={setSelectedTask} />
            ) : (
              <div className="bg-card rounded-2xl p-8 text-center border border-dashed border-border">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground">Nothing to focus on!</h3>
                <p className="text-sm text-muted-foreground mt-1">All tasks done. You've earned a break.</p>
              </div>
            )}
          </motion.div>
        ) : (
          /* Normal view */
          <motion.div
            key="normal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Due Today Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground" data-testid="text-due-today-heading">Due Today</h2>
                <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full" data-testid="badge-task-count">
                  {todaysTasks.length} {todaysTasks.length === 1 ? "task" : "tasks"} left
                </span>
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                  ))
                ) : todaysTasks.length > 0 ? (
                  todaysTasks.map(task => (
                    <TaskCard key={task.id} assignment={task} onTap={setSelectedTask} />
                  ))
                ) : allTodayDone ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-card rounded-2xl p-8 text-center border border-emerald-100 shadow-sm"
                  >
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <PartyPopper className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-foreground font-bold text-lg" data-testid="text-all-caught-up">You're all caught up!</h3>
                    <p className="text-muted-foreground text-sm mt-1">All tasks completed for today.</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-card rounded-2xl p-8 text-center border border-dashed border-border shadow-sm"
                  >
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <PartyPopper className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h3 className="text-foreground font-bold text-lg" data-testid="text-nothing-due">Nothing due today!</h3>
                    <p className="text-muted-foreground text-sm mt-1">Enjoy your free time</p>
                  </motion.div>
                )}
              </div>
            </section>

            {/* Completed Today */}
            {completedToday.length > 0 && (
              <section className="mb-8 opacity-75">
                <h2 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider" data-testid="text-completed-heading">
                  Completed ({completedToday.length})
                </h2>
                <div className="space-y-3">
                  {completedToday.map(task => (
                    <TaskCard key={task.id} assignment={task} compact onTap={setSelectedTask} />
                  ))}
                </div>
              </section>
            )}

            {visibleRecs.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2" data-testid="text-recommendations-heading">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Recommendations
                </h2>
                <Card className="bg-card rounded-2xl border-border overflow-hidden divide-y divide-border">
                  {visibleRecs.map(rec => (
                    <div key={rec.id} className="p-4 relative" data-testid={`recommendation-${rec.id}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{rec.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                          {rec.actionLabel && (
                            <button
                              onClick={() => rec.actionRoute && setLocation(rec.actionRoute)}
                              className="text-xs font-semibold text-indigo-500 mt-2 flex items-center gap-1"
                              data-testid={`button-rec-action-${rec.id}`}
                            >
                              {rec.actionLabel}
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        {rec.dismissible && (
                          <button
                            onClick={() => setDismissedRecs(prev => new Set(prev).add(rec.id))}
                            className="text-slate-300 flex-shrink-0"
                            data-testid={`button-dismiss-rec-${rec.id}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </Card>
              </section>
            )}

            {!sub.isPremium && !sub.trialDismissed && (
              <section className="mb-8">
                <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white border-0" data-testid="card-trial-banner">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">Start your 7-day free trial</p>
                      <p className="text-xs text-white/80 mt-0.5">Access all premium features</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-white text-indigo-600 text-xs font-bold"
                        onClick={sub.startTrial}
                        data-testid="button-start-trial-banner"
                      >
                        Start
                      </Button>
                      <button
                        onClick={sub.dismissTrialBanner}
                        className="text-white/50"
                        data-testid="button-dismiss-trial"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </section>
            )}

            {/* Coming Up Section */}
            <section>
              <h2 className="text-lg font-bold text-foreground mb-4" data-testid="text-coming-up-heading">Coming Up Next</h2>
              <div className="space-y-3">
                {isLoading ? (
                  <Skeleton className="h-20 w-full rounded-2xl" />
                ) : upcomingTasks.length > 0 ? (
                  upcomingTasks.map(task => (
                    <div key={task.id} className="relative pl-6 py-2 border-l-2 border-border ml-2">
                      <div className="absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full bg-muted-foreground ring-4 ring-background" />
                      <p className="text-xs text-muted-foreground font-semibold mb-0.5">
                        {format(new Date(task.dueDate), "MMM d")} - {task.course.code}
                      </p>
                      <h4 className="text-sm font-medium text-foreground">{task.title}</h4>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No upcoming tasks scheduled.</p>
                )}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
      <TaskDetailModal assignment={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
}
