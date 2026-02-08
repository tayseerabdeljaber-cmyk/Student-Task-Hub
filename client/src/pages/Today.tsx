import { format } from "date-fns";
import { useAssignments } from "@/hooks/use-assignments";
import { TaskCard } from "@/components/TaskCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, CheckCircle2 } from "lucide-react";

export default function Today() {
  const { data: assignments, isLoading } = useAssignments();

  // Filter for today's tasks
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="pb-24 px-4 pt-8 max-w-md mx-auto min-h-screen bg-slate-50">
      {/* Header */}
      <header className="mb-8">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
          {format(new Date(), "EEEE, MMMM d")}
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold text-slate-900">
            {getGreeting()}
          </h1>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shadow-sm">
            <Sun className="w-6 h-6" />
          </div>
        </div>
      </header>

      {/* Due Today Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Due Today</h2>
          <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full">
            {todaysTasks.length} tasks
          </span>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))
          ) : todaysTasks.length > 0 ? (
            todaysTasks.map(task => (
              <TaskCard key={task.id} assignment={task} />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-slate-900 font-semibold">You're all caught up!</h3>
              <p className="text-slate-500 text-sm mt-1">No tasks remaining for today.</p>
            </div>
          )}
        </div>
      </section>

      {/* Completed Today (Collapsible if needed, simplified here) */}
      {completedToday.length > 0 && (
        <section className="mb-8 opacity-75">
          <h2 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Completed</h2>
          <div className="space-y-3">
             {completedToday.map(task => (
                <TaskCard key={task.id} assignment={task} compact />
             ))}
          </div>
        </section>
      )}

      {/* Coming Up Section */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Coming Up Next</h2>
        <div className="space-y-3">
          {isLoading ? (
            <Skeleton className="h-20 w-full rounded-2xl" />
          ) : upcomingTasks.length > 0 ? (
            upcomingTasks.map(task => (
              <div key={task.id} className="relative pl-6 py-2 border-l-2 border-slate-200 ml-2">
                <div className="absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-slate-50" />
                <p className="text-xs text-slate-400 font-semibold mb-0.5">
                  {format(new Date(task.dueDate), "MMM d")} • {task.course.code}
                </p>
                <h4 className="text-sm font-medium text-slate-700">{task.title}</h4>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 italic">No upcoming tasks scheduled.</p>
          )}
        </div>
      </section>
    </div>
  );
}
