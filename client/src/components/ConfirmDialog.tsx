import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div
        className="w-[90%] max-w-sm bg-card rounded-2xl p-6 border border-border shadow-lg animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          {variant === "danger" && (
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground text-base" data-testid="text-confirm-title">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-confirm-description">{description}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            data-testid="button-confirm-cancel"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "destructive" : "default"}
            className="flex-1"
            onClick={onConfirm}
            data-testid="button-confirm-action"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
