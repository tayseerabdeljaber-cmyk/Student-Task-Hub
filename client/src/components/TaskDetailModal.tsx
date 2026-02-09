import { format } from "date-fns";
import { X, Clock, BookOpen, GraduationCap, FileText, FlaskConical, Folder, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AssignmentWithCourse } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToggleAssignment } from "@/hooks/use-assignments";

interface TaskDetailModalProps {
  assignment: AssignmentWithCourse | null;
  onClose: () => void;
}

const TYPE_ICONS: Record<string, typeof BookOpen> = {
  homework: BookOpen,
  exam: GraduationCap,
  quiz: FileText,
  lab: FlaskConical,
  reading: BookOpen,
  project: Folder,
};

export function TaskDetailModal({ assignment, onClose }: TaskDetailModalProps) {
  const toggleMutation = useToggleAssignment();
  if (!assignment) return null;
  
  const Icon = TYPE_ICONS[assignment.type] || BookOpen;
  const isOverdue = new Date(assignment.dueDate) < new Date() && !assignment.completed;

  return (
    <AnimatePresence>
      {assignment && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[70]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 bg-card rounded-t-3xl p-6 pb-24 z-[70] max-w-md mx-auto shadow-2xl max-h-[85vh] overflow-y-auto"
            data-testid="modal-task-detail"
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground" data-testid="button-close-detail">
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: `${assignment.course.color}15`,
                    color: assignment.course.color
                  }}
                >
                  {assignment.course.code}
                </span>
                {isOverdue && (
                  <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">OVERDUE</span>
                )}
              </div>

              <h2 className="text-xl font-bold text-foreground mb-1" data-testid="text-detail-title">{assignment.title}</h2>
              <p className="text-sm text-muted-foreground">{assignment.course.name}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Due {format(new Date(assignment.dueDate), "EEEE, MMM d 'at' h:mm a")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="capitalize">{assignment.type}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                <span>{assignment.platform}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  toggleMutation.mutate({ id: assignment.id, completed: !assignment.completed });
                  onClose();
                }}
                className={`flex-1 h-12 rounded-xl text-base font-semibold ${
                  assignment.completed 
                    ? "bg-muted text-foreground"
                    : "bg-emerald-500 text-white"
                }`}
                data-testid="button-mark-complete"
              >
                {assignment.completed ? "Mark Incomplete" : "Mark Complete"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
