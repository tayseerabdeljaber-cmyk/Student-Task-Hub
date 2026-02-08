import { format } from "date-fns";
import { Check, Clock, BookOpen, GraduationCap, FileText, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AssignmentWithCourse } from "@shared/schema";
import { useToggleAssignment } from "@/hooks/use-assignments";

interface TaskCardProps {
  assignment: AssignmentWithCourse;
  compact?: boolean;
}

const TYPE_ICONS = {
  homework: BookOpen,
  exam: GraduationCap,
  quiz: FileText,
  lab: FlaskConical,
};

export function TaskCard({ assignment, compact = false }: TaskCardProps) {
  const toggleMutation = useToggleAssignment();
  const Icon = TYPE_ICONS[assignment.type as keyof typeof TYPE_ICONS] || BookOpen;
  const isOverdue = new Date(assignment.dueDate) < new Date() && !assignment.completed;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMutation.mutate({ 
      id: assignment.id, 
      completed: !assignment.completed 
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layoutId={`task-${assignment.id}`}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-soft transition-all duration-300 hover:shadow-lg hover:border-slate-200",
        assignment.completed && "opacity-60 bg-slate-50",
        compact ? "p-4" : "p-5"
      )}
    >
      {/* Selection Highlight Bar */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1.5 transition-colors",
          assignment.completed ? "bg-emerald-400" : `bg-[${assignment.course.color}]`
        )}
        style={{ backgroundColor: assignment.completed ? undefined : assignment.course.color }}
      />

      <div className="flex items-start gap-4 pl-2">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={toggleMutation.isPending}
          className={cn(
            "mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
            assignment.completed 
              ? "bg-emerald-500 border-emerald-500 text-white" 
              : "border-slate-300 hover:border-primary text-transparent"
          )}
        >
          <Check className="w-3.5 h-3.5 stroke-[4]" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={cn(
              "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600",
              isOverdue && !assignment.completed && "bg-rose-100 text-rose-600"
            )}>
              {assignment.course.code}
            </span>
            {isOverdue && !assignment.completed && (
              <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                OVERDUE
              </span>
            )}
          </div>

          <h3 className={cn(
            "font-display font-semibold text-slate-900 truncate pr-2 transition-all",
            compact ? "text-base" : "text-lg",
            assignment.completed && "line-through text-slate-400"
          )}>
            {assignment.title}
          </h3>

          <div className="mt-2 flex items-center gap-4 text-slate-500 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{format(new Date(assignment.dueDate), "h:mm a")}</span>
            </div>
            
            <div className="flex items-center gap-1.5 capitalize">
              <Icon className="w-3.5 h-3.5" />
              <span>{assignment.type}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
