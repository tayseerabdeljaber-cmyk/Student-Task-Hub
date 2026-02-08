import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SignupProps {
  onSignup: (name: string, email: string) => void;
}

export default function Signup({ onSignup }: SignupProps) {
  const [, setLocation] = useLocation();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName && email && password) {
      onSignup(firstName, email);
      setLocation("/onboarding");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1" data-testid="text-signup-title">Create Account</h1>
          <p className="text-slate-500 text-sm">Join StudyFlow and stay organized</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-12 rounded-xl bg-white border-slate-200 text-base"
            data-testid="input-first-name"
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl bg-white border-slate-200 text-base"
            data-testid="input-signup-email"
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl bg-white border-slate-200 text-base"
            data-testid="input-signup-password"
            required
          />
          <Select value={university} onValueChange={setUniversity}>
            <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 text-base" data-testid="select-university">
              <SelectValue placeholder="Select University" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="purdue">Purdue University</SelectItem>
              <SelectItem value="iu">IU Bloomington</SelectItem>
              <SelectItem value="notre-dame">Notre Dame</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-semibold bg-indigo-500 text-white"
            data-testid="button-create-account"
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <button
            onClick={() => setLocation("/login")}
            className="text-indigo-500 font-semibold"
            data-testid="link-signin"
          >
            Sign in
          </button>
        </p>
      </motion.div>
    </div>
  );
}
