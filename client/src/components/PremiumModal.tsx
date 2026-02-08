import { Sparkles, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
}

export function PremiumModal({ open, onClose }: PremiumModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 z-50 max-w-sm mx-auto shadow-2xl"
            data-testid="modal-premium"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400" data-testid="button-close-premium">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Upgrade to Premium</h2>
              <p className="text-sm text-slate-500 mt-1">Get AI-powered study plans based on your workload</p>
            </div>

            {/* Blurred sample plan */}
            <div className="relative mb-6 rounded-xl bg-slate-50 p-4 overflow-hidden">
              <div className="blur-sm select-none">
                <p className="text-xs font-semibold text-slate-800 mb-2">Your Study Plan for Today</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-slate-600">9:00 AM - Review PHYS Chapter 3</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-slate-600">10:30 AM - CS Homework (45 min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-slate-300" />
                    <span className="text-xs text-slate-600">2:00 PM - Math Problem Set</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-slate-300" />
                    <span className="text-xs text-slate-600">4:00 PM - ENGR Lab prep</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-indigo-600 bg-white/80 px-3 py-1 rounded-full shadow-sm">
                  Premium Feature
                </span>
              </div>
            </div>

            <Button
              className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
              data-testid="button-upgrade"
            >
              Upgrade Now - $4.99/month
            </Button>

            <button
              onClick={onClose}
              className="w-full text-center text-sm text-slate-400 font-medium mt-3 py-2"
              data-testid="link-maybe-later"
            >
              Maybe Later
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
