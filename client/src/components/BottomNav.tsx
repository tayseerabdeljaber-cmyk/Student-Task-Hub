import { Link, useLocation } from "wouter";
import { Calendar, LayoutList, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Today", icon: Layers },
    { href: "/week", label: "Week", icon: Calendar },
    { href: "/all", label: "All Tasks", icon: LayoutList },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 pb-safe pt-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto px-4 h-16">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-full cursor-pointer group"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute -top-2 w-8 h-1 bg-primary rounded-full shadow-[0_2px_8px_rgba(99,102,241,0.5)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <Icon 
                className={cn(
                  "w-6 h-6 mb-1 transition-colors duration-200",
                  isActive 
                    ? "text-primary stroke-[2.5px]" 
                    : "text-slate-400 group-hover:text-slate-600"
                )} 
              />
              <span className={cn(
                "text-[10px] font-medium transition-colors duration-200",
                isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
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
