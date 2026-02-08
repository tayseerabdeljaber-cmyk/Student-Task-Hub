import { useState } from "react";
import { useAssignments } from "@/hooks/use-assignments";
import { useCourses } from "@/hooks/use-courses";
import { TaskCard } from "@/components/TaskCard";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, AlertCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AllTasks() {
  const { data: assignments, isLoading } = useAssignments();
  const { data: courses } = useCourses();
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [laterOpen, setLaterOpen] = useState(false);

  // Helper to categorize tasks
  const categorizeTasks = (taskList: typeof assignments = []) => {
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const overdue: typeof taskList = [];
    const thisWeek: typeof taskList = [];
    const later: typeof taskList = [];
    const completed: typeof taskList = [];

    taskList.forEach(task => {
      // Filter by course if selected
      if (filterCourse !== "all" && task.course.id.toString() !== filterCourse) return;

      if (task.completed) {
        completed.push(task);
        return;
      }

      const due = new Date(task.dueDate);
      if (due < now) {
        overdue.push(task);
      } else if (due <= weekEnd) {
        thisWeek.push(task);
      } else {
        later.push(task);
      }
    });

    return { overdue, thisWeek, later, completed };
  };

  const { overdue, thisWeek, later, completed } = categorizeTasks(assignments);

  return (
    <div className="pb-24 pt-8 px-4 max-w-md mx-auto min-h-screen bg-slate-50">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-slate-900">All Tasks</h1>
        
        {/* Filter Dropdown */}
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-[140px] rounded-full border-slate-200 bg-white shadow-sm h-9 text-xs font-medium">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {courses?.map(course => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {course.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <div className="space-y-8">
        {/* Overdue Section */}
        {overdue.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 text-sm font-bold text-rose-500 uppercase tracking-wider mb-3">
              <AlertCircle className="w-4 h-4" />
              Overdue ({overdue.length})
            </h2>
            <div className="space-y-3">
              {overdue.map(task => (
                <TaskCard key={task.id} assignment={task} />
              ))}
            </div>
          </section>
        )}

        {/* This Week Section */}
        <section>
          <h2 className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider mb-3">
            <Calendar className="w-4 h-4" />
            This Week ({thisWeek.length})
          </h2>
          <div className="space-y-3">
            {thisWeek.length > 0 ? (
              thisWeek.map(task => (
                <TaskCard key={task.id} assignment={task} />
              ))
            ) : (
              !isLoading && <p className="text-slate-400 text-sm italic">No tasks due this week.</p>
            )}
          </div>
        </section>

        {/* Later Section - Collapsible */}
        {later.length > 0 && (
          <Collapsible open={laterOpen} onOpenChange={setLaterOpen}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Later ({later.length})
              </h2>
              <CollapsibleTrigger asChild>
                <button className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                  <ChevronDown className={cn(
                    "w-4 h-4 text-slate-400 transition-transform duration-200",
                    laterOpen && "rotate-180"
                  )} />
                </button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="space-y-3">
              {later.map(task => (
                <TaskCard key={task.id} assignment={task} compact />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Completed Section - Always visible but muted */}
        {completed.length > 0 && (
          <section className="pt-4 border-t border-slate-200">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
              Completed
            </h2>
            <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
              {completed.map(task => (
                <TaskCard key={task.id} assignment={task} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
