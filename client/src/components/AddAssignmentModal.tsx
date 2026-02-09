import { useState } from "react";
import { X, Plus, Calendar, Clock, BookOpen, GraduationCap, FileText, FlaskConical, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCourses } from "@/hooks/use-courses";
import { useCreateAssignment } from "@/hooks/use-assignments";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AddAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
}

const TYPES = [
  { value: "homework", label: "Homework", icon: BookOpen },
  { value: "quiz", label: "Quiz", icon: FileText },
  { value: "exam", label: "Exam", icon: GraduationCap },
  { value: "lab", label: "Lab", icon: FlaskConical },
  { value: "project", label: "Project", icon: Folder },
  { value: "reading", label: "Reading", icon: BookOpen },
];

const PLATFORMS = ["Brightspace", "Gradescope", "Vocareum", "WebAssign", "PearsonMyLab", "Piazza", "In-Class"];

export function AddAssignmentModal({ open, onOpenChange, defaultDate }: AddAssignmentModalProps) {
  const { data: courses = [] } = useCourses();
  const createMutation = useCreateAssignment();
  const { toast } = useToast();

  const getDefaultDate = () => {
    const d = defaultDate || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState<number | "">("");
  const [type, setType] = useState("homework");
  const [platform, setPlatform] = useState("Brightspace");
  const [dueDate, setDueDate] = useState(getDefaultDate());
  const [dueTime, setDueTime] = useState("23:59");

  const resetForm = () => {
    setTitle("");
    setCourseId("");
    setType("homework");
    setPlatform("Brightspace");
    setDueDate(getDefaultDate());
    setDueTime("23:59");
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (!courseId) {
      toast({ title: "Please select a course", variant: "destructive" });
      return;
    }

    const [year, month, day] = dueDate.split("-").map(Number);
    const [hours, minutes] = dueTime.split(":").map(Number);
    const dueDateObj = new Date(year, month - 1, day, hours, minutes);

    createMutation.mutate(
      {
        title: title.trim(),
        courseId: Number(courseId),
        type,
        platform,
        dueDate: dueDateObj,
        completed: false,
      },
      {
        onSuccess: () => {
          toast({ title: "Assignment added" });
          resetForm();
          onOpenChange(false);
        },
        onError: () => {
          toast({ title: "Failed to add assignment", variant: "destructive" });
        },
      }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40" onClick={() => onOpenChange(false)}>
      <div
        className="w-full max-w-md bg-card rounded-t-2xl p-5 pb-24 border-t border-border animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">Add Assignment</h2>
          <Button size="icon" variant="ghost" onClick={() => onOpenChange(false)} data-testid="button-close-add-assignment">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Homework 3"
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              data-testid="input-assignment-title"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(Number(e.target.value))}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              data-testid="select-assignment-course"
            >
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      type === t.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border"
                    )}
                    data-testid={`button-type-${t.value}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              data-testid="select-assignment-platform"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                data-testid="input-assignment-date"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                data-testid="input-assignment-time"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-add-assignment"
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              data-testid="button-save-assignment"
            >
              {createMutation.isPending ? "Adding..." : "Add Assignment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
