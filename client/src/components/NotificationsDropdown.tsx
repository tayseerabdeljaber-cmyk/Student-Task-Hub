import { useState } from "react";
import { Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const SAMPLE_NOTIFICATIONS = [
  { id: 1, text: "CS Homework 2 due in 2 hours", time: "2h ago", read: false },
  { id: 2, text: "Don't forget: PHYS Quiz tomorrow at 9am", time: "5h ago", read: false },
  { id: 3, text: "You're on a 5-day streak! Keep it up", time: "1d ago", read: true },
  { id: 4, text: "Lab Report 1 due in 2 days", time: "1d ago", read: true },
];

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
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
              className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-lg border border-slate-100 z-50 overflow-hidden"
              data-testid="dropdown-notifications"
            >
              <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-slate-900">Notifications</h3>
                <button onClick={() => setOpen(false)} className="text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-slate-50 transition-colors",
                      !notif.read && "bg-indigo-50/50"
                    )}
                    data-testid={`notification-${notif.id}`}
                  >
                    <p className={cn(
                      "text-sm",
                      notif.read ? "text-slate-500" : "text-slate-800 font-medium"
                    )}>
                      {notif.text}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{notif.time}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
