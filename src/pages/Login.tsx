import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { isAxiosError } from "axios";

import apiClient from "@/api/client";
import { useToast } from "@/components/ToastProvider";
import { usePageMetadata } from "@/lib/seo";

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  usePageMetadata({ title: "Log in | HireLens", description: "Log in to your HireLens workspace to analyze resumes and match candidates.", path: "/login", noIndex: true });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        if (response.data.refresh_token) localStorage.setItem("refresh_token", response.data.refresh_token);
        
        // Load the profile for display; a temporary profile lookup failure does not invalidate login.
        try {
          const userResponse = await apiClient.get("/auth/me");
          if (userResponse.data?.full_name) {
            const fullName = userResponse.data.full_name;
            localStorage.setItem("userFirstName", fullName.split(' ')[0]);
            localStorage.setItem("userLastName", fullName.split(' ').slice(1).join(' '));
            window.dispatchEvent(new Event('profileUpdated'));
          }
        } catch { /* The authenticated shell can load the profile after navigation. */ }

        toast("Welcome back to HireLens.", "success");
        navigate("/dashboard");
      } else {
        setError("The server did not return a valid sign-in session.");
      }
    } catch (err: unknown) {
      const detail = isAxiosError(err) ? (err.response?.data as { detail?: unknown } | undefined)?.detail : undefined;
      setError(typeof detail === "string" ? detail : "Unable to sign in. Check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-sm">Enter your credentials to access your workspace</p>
      </div>
      
      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm font-medium text-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium text-slate-100">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="login-email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition-all"
              placeholder="name@company.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="login-password" className="text-sm font-medium text-slate-100">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-indigo-300 hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="login-password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#2563EB] py-2.5 font-semibold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-70"
        >
          {isLoading ? (
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        Don't have an account? <Link to="/signup" className="text-[#4F46E5] hover:underline font-medium">Sign up</Link>
      </div>
    </div>
  );
}
