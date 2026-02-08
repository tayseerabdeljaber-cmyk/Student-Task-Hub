import { Sparkles, X, Check, Star, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-preferences";

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
}

const PREMIUM_FEATURES = [
  "AI-powered schedule planning",
  "Gradescope & Piazza sync",
  "Unlimited activities",
  "Advanced study insights",
  "Custom themes",
  "Priority support",
];

export function PremiumModal({ open, onClose, feature }: PremiumModalProps) {
  const sub = useSubscription();

  const handleStartTrial = () => {
    sub.startTrial();
    onClose();
  };

  const handleUpgrade = () => {
    sub.upgrade();
    onClose();
  };

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
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-card rounded-3xl p-6 z-50 max-w-sm mx-auto shadow-2xl"
            data-testid="modal-premium"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground" data-testid="button-close-premium">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {feature ? "Premium Feature" : "Upgrade to Premium"}
              </h2>
              {feature && (
                <p className="text-sm text-muted-foreground mt-1">
                  This feature requires a Premium subscription
                </p>
              )}
            </div>

            <div className="space-y-2.5 mb-5">
              {PREMIUM_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-foreground">{f}</span>
                </div>
              ))}
            </div>

            <div className="bg-background rounded-xl p-4 mb-5 text-center">
              <p className="text-2xl font-bold text-foreground">$4.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              <p className="text-xs text-muted-foreground mt-0.5">or $39.99/year (save 33%)</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs text-indigo-600 font-medium">First month free with .edu email</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
              onClick={handleStartTrial}
              data-testid="button-start-trial"
            >
              <Star className="w-4 h-4 mr-2" />
              Start 7-Day Free Trial
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-xl font-semibold mt-2"
              onClick={handleUpgrade}
              data-testid="button-upgrade"
            >
              Upgrade Now - $4.99/month
            </Button>

            <button
              onClick={onClose}
              className="w-full text-center text-sm text-muted-foreground font-medium mt-3 py-2"
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
