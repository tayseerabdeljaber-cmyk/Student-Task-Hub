import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginProps {
  onLogin: (email: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200" data-testid="img-logo">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-app-name">StudyFlow</h1>
          <p className="text-muted-foreground text-base" data-testid="text-tagline">Never miss an assignment again</p>
          <p className="text-muted-foreground text-sm mt-1">Your stress-free student planner</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Student's Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl bg-card border-border text-base"
              data-testid="input-email"
              required
            />
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl bg-card border-border text-base pr-12"
              data-testid="input-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              data-testid="button-toggle-password"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-semibold bg-indigo-500 text-white"
            data-testid="button-sign-in"
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <button
            onClick={() => setLocation("/signup")}
            className="text-indigo-500 font-semibold"
            data-testid="link-signup"
          >
            Sign up
          </button>
        </p>
      </motion.div>
    </div>
  );
}
