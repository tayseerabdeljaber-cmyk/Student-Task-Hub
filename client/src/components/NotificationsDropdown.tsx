import { useState } from "react";
import { useLocation } from "wouter";
import {
  Bell, X, BookOpen, AlertTriangle, Coffee, Trophy,
  Flame, GraduationCap, FileText, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";

const ICON_MAP: Record<string, typeof Bell> = {
  BookOpen,
  AlertTriangle,
  Coffee,
  Trophy,
  Flame,
  GraduationCap,
  FileText,
  CheckCircle2,
};

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { unreadCount, grouped, markAsRead, markAllRead, dismiss } = useAppNotifications();

  const handleTap = (id: string, route?: string) => {
    markAsRead(id);
    if (route) {
      setOpen(false);
      setLocation(route);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm"
        data-testid="button-notifications"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" data-testid="badge-notification-count">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-lg border border-slate-100 z-50 overflow-hidden"
              data-testid="dropdown-notifications"
            >
              <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-slate-900">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-indigo-500 font-medium"
                      data-testid="button-mark-all-read"
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {grouped.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No notifications</p>
                  </div>
                ) : (
                  grouped.map(group => (
                    <div key={group.label}>
                      <div className="px-4 py-1.5 bg-slate-50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{group.label}</p>
                      </div>
                      {group.items.map(notif => {
                        const Icon = ICON_MAP[notif.icon] || Bell;
                        return (
                          <div
                            key={notif.id}
                            className={cn(
                              "relative group",
                              !notif.read && "bg-indigo-50/40"
                            )}
                          >
                            <button
                              onClick={() => handleTap(notif.id, notif.route)}
                              className="w-full text-left px-4 py-3 flex items-start gap-3"
                              data-testid={`notification-${notif.id}`}
                            >
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                                notif.type === "assignment_due" && "bg-amber-100",
                                notif.type === "study_time" && "bg-blue-100",
                                notif.type === "break" && "bg-green-100",
                                notif.type === "streak" && "bg-orange-100",
                                notif.type === "achievement" && "bg-purple-100",
                                notif.type === "exam_soon" && "bg-rose-100",
                              )}>
                                <Icon className={cn(
                                  "w-4 h-4",
                                  notif.type === "assignment_due" && "text-amber-600",
                                  notif.type === "study_time" && "text-blue-600",
                                  notif.type === "break" && "text-green-600",
                                  notif.type === "streak" && "text-orange-600",
                                  notif.type === "achievement" && "text-purple-600",
                                  notif.type === "exam_soon" && "text-rose-600",
                                )} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-sm leading-tight",
                                  notif.read ? "text-slate-500" : "text-slate-800 font-medium"
                                )}>
                                  {notif.title}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5 truncate">{notif.body}</p>
                                <p className="text-[10px] text-slate-300 mt-1">
                                  {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                                </p>
                              </div>
                              {!notif.read && (
                                <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
                              )}
                            </button>
                            <button
                              onClick={() => dismiss(notif.id)}
                              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300"
                              data-testid={`dismiss-notification-${notif.id}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
