import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { useAssignments } from "@/hooks/use-assignments";
import { TaskCard } from "@/components/TaskCard";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Week() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: assignments, isLoading } = useAssignments();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }); // Sunday start
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Filter tasks for selected day
  const dailyTasks = assignments?.filter(task => 
    isSameDay(new Date(task.dueDate), selectedDate)
  ) || [];

  return (
    <div className="pb-24 pt-6 min-h-screen bg-slate-50 flex flex-col">
      <header className="px-4 mb-6 sticky top-0 bg-slate-50/95 backdrop-blur z-10 py-2">
        <h1 className="text-2xl font-display font-bold text-slate-900 mb-4">
          {format(new Date(), "MMMM yyyy")}
        </h1>
        
        {/* Date Strip */}
        <div className="flex justify-between items-center bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
          {weekDays.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex flex-col items-center justify-center w-10 h-14 rounded-xl transition-all duration-200 relative",
                  isSelected ? "bg-primary text-white shadow-md shadow-indigo-200 scale-105" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <span className="text-[10px] font-medium uppercase tracking-tighter opacity-80">
                  {format(date, "EEE")}
                </span>
                <span className={cn(
                  "text-lg font-bold leading-none mt-0.5",
                  isSelected ? "text-white" : "text-slate-700"
                )}>
                  {format(date, "d")}
                </span>
                
                {isToday && !isSelected && (
                  <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1 px-4 max-w-md mx-auto w-full">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
          {isSameDay(selectedDate, new Date()) ? "Today's Schedule" : format(selectedDate, "EEEE, MMM d")}
        </h2>

        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
          ) : dailyTasks.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {dailyTasks.map(task => (
                <TaskCard key={task.id} assignment={task} />
              ))}
            </AnimatePresence>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-64 text-center"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">☕️</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No tasks due</h3>
              <p className="text-slate-500 text-sm max-w-[200px]">
                Enjoy your free time or get ahead on upcoming work.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
