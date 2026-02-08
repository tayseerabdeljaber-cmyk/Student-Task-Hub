import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Link2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      localStorage.setItem("brightspaceConnected", "true");
      setTimeout(() => setLocation("/"), 1000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Link2 className="w-10 h-10 text-indigo-500" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2" data-testid="text-onboarding-title">
          Let's connect your accounts
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          Sync your assignments automatically from your learning platforms
        </p>

        <Button
          onClick={handleConnect}
          disabled={connecting || connected}
          className="w-full h-14 rounded-xl text-base font-semibold bg-orange-500 text-white mb-4"
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

        <button
          onClick={() => setLocation("/")}
          className="text-slate-400 text-sm font-medium"
          data-testid="link-skip-onboarding"
        >
          Skip for now
        </button>
      </motion.div>
    </div>
  );
}
