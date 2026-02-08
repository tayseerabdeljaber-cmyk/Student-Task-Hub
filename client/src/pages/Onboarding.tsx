import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2, Check, Loader2, Sparkles, Calendar,
  Target, ArrowRight, ArrowLeft, Sun, Moon, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "welcome", title: "Welcome to StudyFlow" },
  { id: "platforms", title: "Connect Platforms" },
  { id: "preferences", title: "Study Style" },
  { id: "ready", title: "You're All Set" },
];

type StudyTime = "morning" | "afternoon" | "evening" | "flexible";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [studyTime, setStudyTime] = useState<StudyTime>("morning");
  const [goals, setGoals] = useState<string[]>([]);

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      localStorage.setItem("brightspaceConnected", "true");
    }, 2000);
  };

  const toggleGoal = (goal: string) => {
    setGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const finish = () => {
    localStorage.setItem("studyflow_study_time", studyTime);
    localStorage.setItem("studyflow_goals", JSON.stringify(goals));
    localStorage.setItem("studyflow_onboarded", "true");
    setLocation("/");
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);
  const goNext = () => { setDirection(1); next(); };
  const goPrev = () => { setDirection(-1); prev(); };

  const STUDY_OPTIONS: { value: StudyTime; label: string; icon: typeof Sun; desc: string }[] = [
    { value: "morning", label: "Morning Person", icon: Sun, desc: "6am - 12pm" },
    { value: "afternoon", label: "Afternoon Focus", icon: Target, desc: "12pm - 6pm" },
    { value: "evening", label: "Night Owl", icon: Moon, desc: "6pm - 12am" },
    { value: "flexible", label: "Flexible", icon: Brain, desc: "Anytime works" },
  ];

  const GOAL_OPTIONS = [
    "Stay on top of deadlines",
    "Build study habits",
    "Reduce stress",
    "Improve grades",
    "Better time management",
    "Exam preparation",
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center gap-1.5 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i <= step ? "bg-indigo-500 w-8" : "bg-slate-200 w-4"
              )}
              data-testid={`step-indicator-${i}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="text-center"
          >
            {step === 0 && (
              <div>
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2" data-testid="text-welcome-title">
                  Welcome to StudyFlow
                </h1>
                <p className="text-slate-500 text-sm mb-3">
                  Your calm, organized study companion
                </p>
                <div className="space-y-3 text-left mt-8">
                  {[
                    { icon: Calendar, text: "Auto-import assignments from Brightspace" },
                    { icon: Brain, text: "AI-powered study schedule generation" },
                    { icon: Target, text: "Track progress and build streaks" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
                      <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4.5 h-4.5 text-indigo-500" />
                      </div>
                      <p className="text-sm text-slate-700">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Link2 className="w-10 h-10 text-indigo-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2" data-testid="text-onboarding-title">
                  Connect your platforms
                </h1>
                <p className="text-slate-500 text-sm mb-8">
                  Sync assignments automatically
                </p>

                <Button
                  size="lg"
                  onClick={handleConnect}
                  disabled={connecting || connected}
                  className="w-full rounded-xl font-semibold bg-orange-500 text-white mb-3"
                  data-testid="button-connect-brightspace"
                >
                  {connecting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </span>
                  ) : connected ? (
                    <span className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      Connected!
                    </span>
                  ) : (
                    "Connect Brightspace"
                  )}
                </Button>

                <div className="space-y-2 mt-4">
                  {["Gradescope", "Piazza", "WebAssign"].map(platform => (
                    <Card key={platform} className="p-3 flex items-center justify-between bg-white border-slate-100">
                      <span className="text-sm text-slate-600">{platform}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full font-medium">Coming Soon</span>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="text-left">
                <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center" data-testid="text-study-style-title">
                  When do you study best?
                </h1>
                <p className="text-slate-500 text-sm mb-6 text-center">
                  We'll optimize your schedule around your peak hours
                </p>

                <div className="grid grid-cols-2 gap-2.5 mb-8">
                  {STUDY_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    const isSelected = studyTime === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setStudyTime(opt.value)}
                        className={cn(
                          "p-3.5 rounded-xl border-2 text-left transition-all",
                          isSelected
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-100 bg-white"
                        )}
                        data-testid={`button-study-${opt.value}`}
                      >
                        <Icon className={cn(
                          "w-5 h-5 mb-1.5",
                          isSelected ? "text-indigo-500" : "text-slate-400"
                        )} />
                        <p className={cn(
                          "text-sm font-semibold",
                          isSelected ? "text-indigo-700" : "text-slate-700"
                        )}>{opt.label}</p>
                        <p className="text-[10px] text-slate-400">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>

                <h3 className="text-sm font-bold text-slate-800 mb-3 text-center">What are your goals?</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {GOAL_OPTIONS.map(goal => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        goals.includes(goal)
                          ? "bg-indigo-500 text-white border-indigo-500"
                          : "bg-white text-slate-600 border-slate-200"
                      )}
                      data-testid={`button-goal-${goal.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2" data-testid="text-ready-title">
                  You're all set!
                </h1>
                <p className="text-slate-500 text-sm mb-6">
                  StudyFlow is ready to help you stay on track
                </p>
                <div className="space-y-3 text-left">
                  <div className="bg-white rounded-xl p-4 border border-slate-100">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Your setup</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Brightspace</span>
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          connected ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                        )}>
                          {connected ? "Connected" : "Skipped"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Study preference</span>
                        <span className="text-xs font-medium text-indigo-600 capitalize">{studyTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Goals</span>
                        <span className="text-xs font-medium text-slate-500">{goals.length || 0} selected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={goPrev}
              className="rounded-xl"
              data-testid="button-onboarding-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="lg"
            onClick={goNext}
            className="flex-1 rounded-xl font-semibold bg-indigo-500 text-white"
            data-testid="button-onboarding-next"
          >
            {step === STEPS.length - 1 ? "Get Started" : "Continue"}
            {step < STEPS.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>

        {step < STEPS.length - 1 && (
          <button
            onClick={finish}
            className="w-full text-center text-sm text-slate-400 font-medium mt-4"
            data-testid="link-skip-onboarding"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
