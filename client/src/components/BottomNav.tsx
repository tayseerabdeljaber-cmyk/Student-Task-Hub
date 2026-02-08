import { Link, useLocation } from "wouter";
import { Calendar, LayoutList, Layers, Settings, ListChecks, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Today", icon: Layers },
    { href: "/week", label: "Week", icon: Calendar },
    { href: "/activities", label: "Activities", icon: ListChecks },
    { href: "/schedule", label: "Schedule", icon: CalendarDays },
    { href: "/all", label: "All", icon: LayoutList },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 pb-safe pt-1 z-50" data-testid="nav-bottom">
      <div className="flex justify-around items-center max-w-lg mx-auto px-1 h-14">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-14 h-full cursor-pointer"
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              {isActive && (
                <div
                  className="absolute -top-1 w-6 h-0.5 bg-indigo-500 rounded-full"
                />
              )}

              <Icon
                className={cn(
                  "w-5 h-5 mb-0.5 transition-colors duration-200",
                  isActive
                    ? "text-indigo-500 stroke-[2.5px]"
                    : "text-slate-400"
                )}
              />
              <span className={cn(
                "text-[9px] font-medium transition-colors duration-200",
                isActive ? "text-indigo-500" : "text-slate-400"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
