import { Cloud, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import { useSyncStatus } from "@/hooks/use-preferences";

export function SyncIndicator() {
  const { status, timeSinceSync, triggerSync } = useSyncStatus();

  if (status === "syncing") {
    return (
      <button
        className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-indigo-50 text-indigo-600 text-xs font-medium"
        data-testid="sync-indicator"
        disabled
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Syncing...
      </button>
    );
  }

  if (status === "error") {
    return (
      <button
        onClick={triggerSync}
        className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-amber-50 text-amber-700 text-xs font-medium"
        data-testid="sync-indicator"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        Last sync failed
        <span className="underline ml-1">Retry</span>
      </button>
    );
  }

  const timeLabel = timeSinceSync === null
    ? "Never synced"
    : timeSinceSync < 1
    ? "Just now"
    : timeSinceSync < 60
    ? `${timeSinceSync}m ago`
    : `${Math.floor(timeSinceSync / 60)}h ago`;

  return (
    <button
      onClick={triggerSync}
      className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-50 text-slate-500 text-xs font-medium"
      data-testid="sync-indicator"
    >
      <Cloud className="w-3.5 h-3.5" />
      Synced {timeLabel}
      <RefreshCw className="w-3 h-3 ml-1 opacity-50" />
    </button>
  );
}
