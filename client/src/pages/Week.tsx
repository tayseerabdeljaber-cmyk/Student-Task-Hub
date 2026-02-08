import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from "date-fns";
import { useAssignments } from "@/hooks/use-assignments";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { AddAssignmentModal } from "@/components/AddAssignmentModal";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from "lucide-react";
import type { AssignmentWithCourse } from "@shared/schema";

export default function Week() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<AssignmentWithCourse | null>(null);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const { data: assignments, isLoading } = useAssignments();

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  const dailyTasks = assignments?.filter((task: AssignmentWithCourse) =>
    isSameDay(new Date(task.dueDate), selectedDate) && !task.completed
  ).sort((a: AssignmentWithCourse, b: AssignmentWithCourse) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) || [];

  const completedDaily = assignments?.filter((task: AssignmentWithCourse) =>
    isSameDay(new Date(task.dueDate), selectedDate) && task.completed
  ) || [];

  const getTaskCountForDay = (date: Date) => {
    return assignments?.filter((task: AssignmentWithCourse) =>
      isSameDay(new Date(task.dueDate), date) && !task.completed
    ).length || 0;
  };

  const groupByTimeOfDay = (tasks: AssignmentWithCourse[]) => {
    const morning = tasks.filter((t: AssignmentWithCourse) => new Date(t.dueDate).getHours() < 12);
    const afternoon = tasks.filter((t: AssignmentWithCourse) => {
      const h = new Date(t.dueDate).getHours();
      return h >= 12 && h < 17;
    });
    const evening = tasks.filter((t: AssignmentWithCourse) => new Date(t.dueDate).getHours() >= 17);
    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = groupByTimeOfDay(dailyTasks);
  const isViewingToday = isSameDay(selectedDate, new Date());
  const isCurrentWeek = isSameDay(currentWeekStart, startOfWeek(new Date(), { weekStartsOn: 0 }));

  const handlePrevWeek = () => {
    const newStart = subWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newStart);
    setSelectedDate(newStart);
  };

  const handleNextWeek = () => {
    const newStart = addWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newStart);
    setSelectedDate(newStart);
  };

  const jumpToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
    setSelectedDate(new Date());
  };

  const renderTimeGroup = (label: string, tasks: AssignmentWithCourse[]) => {
    if (tasks.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{label}</h3>
        <div className="space-y-3">
          {tasks.map((task: AssignmentWithCourse) => (
            <TaskCard key={task.id} assignment={task} compact onTap={setSelectedTask} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-24 pt-6 min-h-screen bg-background flex flex-col">
      <header className="px-4 mb-6 sticky top-0 bg-background/95 backdrop-blur z-[100] py-2">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevWeek} className="p-2 text-muted-foreground" data-testid="button-prev-week">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground" data-testid="text-week-header">
            {format(currentWeekStart, "MMM d")} - {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
          </h1>
          <button onClick={handleNextWeek} className="p-2 text-muted-foreground" data-testid="button-next-week">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-between items-center bg-card rounded-2xl p-2 shadow-sm border border-border">
          {weekDays.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const taskCount = getTaskCountForDay(date);

            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex flex-col items-center justify-center w-10 h-16 rounded-xl transition-all duration-200 relative",
                  isSelected ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground"
                )}
                data-testid={`button-day-${format(date, "d")}`}
              >
                <span className="text-[10px] font-medium uppercase tracking-tighter opacity-80">
                  {format(date, "EEE")}
                </span>
                <span className={cn(
                  "text-lg font-bold leading-none mt-0.5",
                  isSelected ? "text-primary-foreground" : "text-foreground"
                )}>
                  {format(date, "d")}
                </span>

                {taskCount > 0 && (
                  <span className={cn(
                    "text-[9px] font-bold mt-0.5",
                    isSelected ? "text-primary-foreground/70" : "text-primary"
                  )}>
                    {taskCount}
                  </span>
                )}

                {isToday && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1 px-4 max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider" data-testid="text-selected-day">
            {isViewingToday ? "Today's Schedule" : format(selectedDate, "EEEE, MMM d")}
          </h2>
          {!isCurrentWeek && (
            <button
              onClick={jumpToToday}
              className="text-xs font-semibold text-primary flex items-center gap-1"
              data-testid="button-jump-today"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Jump to Today
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl mb-3" />)
            ) : dailyTasks.length > 0 || completedDaily.length > 0 ? (
              <>
                {renderTimeGroup("Morning (before 12pm)", morning)}
                {renderTimeGroup("Afternoon (12-5pm)", afternoon)}
                {renderTimeGroup("Evening (after 5pm)", evening)}

                {completedDaily.length > 0 && (
                  <div className="mb-6 opacity-60">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Completed</h3>
                    <div className="space-y-3">
                      {completedDaily.map((task: AssignmentWithCourse) => (
                        <TaskCard key={task.id} assignment={task} compact onTap={setSelectedTask} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <CalendarDays className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-base font-semibold text-foreground">No tasks due</h3>
                <p className="text-muted-foreground text-sm mt-1">Enjoy your free time or get ahead.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => setAddTaskOpen(true)}
          className="w-full flex items-center justify-center gap-2 text-sm text-primary font-semibold py-3 border border-dashed border-primary/30 rounded-xl mt-4"
          data-testid="button-add-task"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </main>

      <TaskDetailModal assignment={selectedTask} onClose={() => setSelectedTask(null)} />
      <AddAssignmentModal open={addTaskOpen} onOpenChange={setAddTaskOpen} defaultDate={selectedDate} />
    </div>
  );
}
