import { useState } from "react";
import { useAssignments } from "@/hooks/use-assignments";
import { useCourses } from "@/hooks/use-courses";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailModal } from "@/components/TaskDetailModal";
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
import { ChevronDown, AlertCircle, Calendar, Search, ArrowDownUp, SearchX, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { AssignmentWithCourse } from "@shared/schema";

export default function AllTasks() {
  const { data: assignments, isLoading } = useAssignments();
  const { data: courses } = useCourses();
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [laterOpen, setLaterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("due-date");
  const [selectedTask, setSelectedTask] = useState<AssignmentWithCourse | null>(null);

  const sortTasks = (tasks: AssignmentWithCourse[]) => {
    const sorted = [...tasks];
    switch (sortBy) {
      case "course":
        return sorted.sort((a, b) => a.course.code.localeCompare(b.course.code));
      case "type":
        return sorted.sort((a, b) => a.type.localeCompare(b.type));
      default:
        return sorted.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }
  };

  const categorizeTasks = (taskList: AssignmentWithCourse[] = []) => {
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const overdue: AssignmentWithCourse[] = [];
    const thisWeek: AssignmentWithCourse[] = [];
    const later: AssignmentWithCourse[] = [];
    const completed: AssignmentWithCourse[] = [];

    taskList.forEach(task => {
      if (filterCourse !== "all" && task.course.id.toString() !== filterCourse) return;
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return;

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

    return {
      overdue: sortTasks(overdue),
      thisWeek: sortTasks(thisWeek),
      later: sortTasks(later),
      completed
    };
  };

  const { overdue, thisWeek, later, completed } = categorizeTasks(assignments);

  return (
    <div className="pb-24 pt-8 px-4 max-w-md mx-auto min-h-screen bg-slate-50">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-4" data-testid="text-all-tasks-title">All Tasks</h1>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-white border-slate-200 text-sm"
            data-testid="input-search"
          />
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2">
          <Select value={filterCourse} onValueChange={setFilterCourse}>
            <SelectTrigger className="flex-1 rounded-xl border-slate-200 bg-white shadow-sm h-9 text-xs font-medium" data-testid="select-filter-course">
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

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px] rounded-xl border-slate-200 bg-white shadow-sm h-9 text-xs font-medium" data-testid="select-sort">
              <ArrowDownUp className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due-date">Due Date</SelectItem>
              <SelectItem value="course">Course</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="space-y-6">
        {isLoading && (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && searchQuery && overdue.length === 0 && thisWeek.length === 0 && later.length === 0 && completed.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200 shadow-sm"
          >
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <SearchX className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-semibold" data-testid="text-no-search-results">No results found</h3>
            <p className="text-sm text-slate-500 mt-1">No assignments match "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm text-indigo-500 font-medium mt-3"
              data-testid="button-clear-search"
            >
              Clear search
            </button>
          </motion.div>
        )}

        {!isLoading && !searchQuery && overdue.length === 0 && thisWeek.length === 0 && later.length === 0 && completed.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-200 shadow-sm"
          >
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="text-slate-900 font-semibold">No assignments yet</h3>
            <p className="text-sm text-slate-500 mt-1">Your assignments will appear here once synced</p>
          </motion.div>
        )}

        {/* Overdue Section */}
        {overdue.length > 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="flex items-center gap-2 text-sm font-bold text-rose-500 uppercase tracking-wider mb-3" data-testid="text-overdue-heading">
              <AlertCircle className="w-4 h-4" />
              Overdue ({overdue.length})
            </h2>
            <div className="space-y-3">
              {overdue.map(task => (
                <TaskCard key={task.id} assignment={task} onTap={setSelectedTask} />
              ))}
            </div>
          </motion.section>
        )}

        {/* This Week Section */}
        <section>
          <h2 className="flex items-center gap-2 text-sm font-bold text-indigo-500 uppercase tracking-wider mb-3" data-testid="text-this-week-heading">
            <Calendar className="w-4 h-4" />
            This Week ({thisWeek.length})
          </h2>
          <div className="space-y-3">
            {thisWeek.length > 0 ? (
              thisWeek.map(task => (
                <TaskCard key={task.id} assignment={task} onTap={setSelectedTask} />
              ))
            ) : (
              !isLoading && <p className="text-slate-400 text-sm italic">No tasks due this week.</p>
            )}
          </div>
        </section>

        {/* Later Section - Collapsible */}
        {later.length > 0 && (
          <Collapsible open={laterOpen} onOpenChange={setLaterOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between w-full mb-3" data-testid="button-toggle-later">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Later
                </h2>
                <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                  {laterOpen ? "Collapse" : `Tap to expand (${later.length} more)`}
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    laterOpen && "rotate-180"
                  )} />
                </span>
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-3">
              {later.map(task => (
                <TaskCard key={task.id} assignment={task} compact onTap={setSelectedTask} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Completed Section */}
        {completed.length > 0 && (
          <section className="pt-4 border-t border-slate-200">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3" data-testid="text-completed-heading">
              Completed ({completed.length})
            </h2>
            <div className="space-y-3 opacity-60">
              {completed.map(task => (
                <TaskCard key={task.id} assignment={task} compact onTap={setSelectedTask} />
              ))}
            </div>
          </section>
        )}
      </div>

      <TaskDetailModal assignment={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
}
