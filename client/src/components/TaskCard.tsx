import { format } from "date-fns";
import { Check, Clock, BookOpen, GraduationCap, FileText, FlaskConical, Trash2, Folder } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AssignmentWithCourse } from "@shared/schema";
import { useToggleAssignment, useDeleteAssignment } from "@/hooks/use-assignments";

interface TaskCardProps {
  assignment: AssignmentWithCourse;
  compact?: boolean;
  onTap?: (assignment: AssignmentWithCourse) => void;
}

const TYPE_ICONS: Record<string, typeof BookOpen> = {
  homework: BookOpen,
  exam: GraduationCap,
  quiz: FileText,
  lab: FlaskConical,
  reading: BookOpen,
  project: Folder,
};

const PLATFORM_COLORS: Record<string, string> = {
  "Brightspace": "bg-orange-100 text-orange-700",
  "Gradescope": "bg-teal-100 text-teal-700",
  "Piazza": "bg-blue-100 text-blue-700",
  "Vocareum": "bg-purple-100 text-purple-700",
  "PearsonMyLab": "bg-indigo-100 text-indigo-700",
  "WebAssign": "bg-rose-100 text-rose-700",
  "In-Class": "bg-slate-100 text-slate-600",
};

export function TaskCard({ assignment, compact = false, onTap }: TaskCardProps) {
  const toggleMutation = useToggleAssignment();
  const deleteMutation = useDeleteAssignment();
  const Icon = TYPE_ICONS[assignment.type] || BookOpen;
  const isOverdue = new Date(assignment.dueDate) < new Date() && !assignment.completed;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMutation.mutate({
      id: assignment.id,
      completed: !assignment.completed
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(assignment.id);
  };

  const platformClass = PLATFORM_COLORS[assignment.platform] || "bg-slate-100 text-slate-600";

  return (
    <div
      onClick={() => onTap?.(assignment)}
      className={cn(
        "group relative rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-300",
        assignment.completed && "opacity-60 bg-slate-50",
        compact ? "p-4" : "p-5",
        onTap && "cursor-pointer"
      )}
      data-testid={`card-task-${assignment.id}`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
        style={{ backgroundColor: assignment.completed ? "#10b981" : assignment.course.color }}
      />

      <div className="flex items-start gap-3 pl-2">
        <button
          onClick={handleToggle}
          disabled={toggleMutation.isPending}
          className={cn(
            "mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
            assignment.completed
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-slate-300 text-transparent"
          )}
          data-testid={`button-toggle-${assignment.id}`}
        >
          <Check className="w-3.5 h-3.5 stroke-[4]" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: `${assignment.course.color}15`,
                color: assignment.course.color
              }}
              data-testid={`text-course-${assignment.id}`}
            >
              {assignment.course.code}
            </span>
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", platformClass)} data-testid={`badge-platform-${assignment.id}`}>
              {assignment.platform}
            </span>
            {isOverdue && (
              <span className="text-[10px] font-bold text-rose-500">OVERDUE</span>
            )}
          </div>

          <h3 className={cn(
            "font-semibold text-slate-900 truncate pr-2 transition-all",
            compact ? "text-sm" : "text-base",
            assignment.completed && "line-through text-slate-400"
          )} data-testid={`text-title-${assignment.id}`}>
            {assignment.title}
          </h3>

          <div className="mt-1.5 flex items-center gap-3 text-slate-500 text-xs font-medium">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{format(new Date(assignment.dueDate), "h:mm a")}</span>
            </div>
            <div className="flex items-center gap-1 capitalize">
              <Icon className="w-3.5 h-3.5" />
              <span>{assignment.type}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="invisible group-hover:visible p-1.5 text-slate-400 mt-1 flex-shrink-0 transition-colors"
          data-testid={`button-delete-${assignment.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
