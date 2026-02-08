import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  User, Link2, Bell, Flame, Moon, Info, LogOut, 
  ChevronRight, Plus, RotateCcw
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SettingsProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

export default function Settings({ userName, userEmail, onLogout }: SettingsProps) {
  const [, setLocation] = useLocation();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [reminderTime, setReminderTime] = useState("1-day");
  const [darkMode, setDarkMode] = useState(false);
  const brightspaceConnected = localStorage.getItem("brightspaceConnected") === "true";

  const streak = Number(localStorage.getItem("studyStreak") || "5");

  const handleLogout = () => {
    onLogout();
    setLocation("/login");
  };

  return (
    <div className="pb-24 pt-8 px-4 max-w-md mx-auto min-h-screen bg-slate-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold text-slate-900 mb-6" data-testid="text-settings-title">Settings</h1>

        {/* Profile Section */}
        <Card className="p-5 rounded-2xl mb-4 bg-white border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-indigo-500" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-lg" data-testid="text-profile-name">{userName}</h2>
              <p className="text-sm text-slate-500" data-testid="text-profile-email">{userEmail}</p>
              <p className="text-xs text-slate-400 mt-0.5">Purdue University</p>
            </div>
          </div>
        </Card>

        {/* Connected Accounts */}
        <Card className="p-5 rounded-2xl mb-4 bg-white border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-slate-500" />
            Connected Accounts
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-xs">B</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Brightspace</p>
                  <p className="text-xs text-slate-400">{brightspaceConnected ? "Connected" : "Not connected"}</p>
                </div>
              </div>
              <Switch checked={brightspaceConnected} data-testid="switch-brightspace" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">G</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Gradescope</p>
                  <p className="text-xs text-slate-400">Not connected</p>
                </div>
              </div>
              <button className="text-xs text-indigo-500 font-medium flex items-center gap-1" data-testid="button-reconnect-gradescope">
                <RotateCcw className="w-3 h-3" /> Connect
              </button>
            </div>

            <button className="w-full flex items-center justify-center gap-2 text-sm text-indigo-500 font-medium py-2 border border-dashed border-indigo-200 rounded-xl" data-testid="button-add-platform">
              <Plus className="w-4 h-4" />
              Add Platform
            </button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-5 rounded-2xl mb-4 bg-white border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-500" />
            Notifications
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Push Notifications</span>
              <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} data-testid="switch-push-notifications" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Remind me</span>
              <Select value={reminderTime} onValueChange={setReminderTime}>
                <SelectTrigger className="w-[140px] rounded-lg border-slate-200 bg-slate-50 h-9 text-xs" data-testid="select-reminder-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-hour">1 hour before</SelectItem>
                  <SelectItem value="1-day">1 day before</SelectItem>
                  <SelectItem value="1-week">1 week before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Study Streak */}
        <Card className="p-5 rounded-2xl mb-4 bg-white border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Study Streak
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900" data-testid="text-streak-count">{streak}</p>
              <p className="text-xs text-slate-500">day streak</p>
            </div>
            <div className="flex-1 grid grid-cols-7 gap-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-full aspect-square rounded-sm ${
                    i < streak + 2 ? "bg-indigo-500" : i < 10 ? "bg-indigo-200" : "bg-slate-100"
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Theme */}
        <Card className="p-5 rounded-2xl mb-4 bg-white border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-900">Dark Mode</span>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} data-testid="switch-dark-mode" />
          </div>
          <p className="text-xs text-slate-400 mt-1 ml-6">Coming soon</p>
        </Card>

        {/* About */}
        <Card className="p-5 rounded-2xl mb-4 bg-white border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500" />
            About
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Version</span>
              <span className="text-sm text-slate-700 font-medium" data-testid="text-app-version">1.0.0</span>
            </div>
            <button className="w-full flex items-center justify-between text-sm text-slate-700 py-2" data-testid="button-feedback">
              Give Feedback
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </Card>

        {/* Log Out */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-12 rounded-xl text-base font-semibold text-rose-500 border-rose-200 mt-4"
          data-testid="button-logout"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </motion.div>
    </div>
  );
}
