import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User as UserIcon, UserPlus } from "lucide-react";
import { isAxiosError } from "axios";
import apiClient from "@/api/client";
import { useToast } from "@/components/ToastProvider";
import { usePageMetadata } from "@/lib/seo";

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  usePageMetadata({ title: "Create an account | HireLens", description: "Create a HireLens account for AI-assisted resume analysis and job matching.", path: "/signup", noIndex: true });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      await apiClient.post("/auth/register", { 
        email, 
        password,
        full_name: fullName
      });
      // Auto-login after register
      const response = await apiClient.post("/auth/login", { email, password });
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        if (response.data.refresh_token) localStorage.setItem("refresh_token", response.data.refresh_token);
        localStorage.setItem("userFirstName", fullName.split(' ')[0]);
        localStorage.setItem("userLastName", fullName.split(' ').slice(1).join(' '));
        window.dispatchEvent(new Event('profileUpdated'));
        toast("Your HireLens account is ready.", "success");
        navigate("/dashboard");
      } else {
        toast("Your account was created. Please sign in to continue.", "info");
        navigate("/login");
      }
    } catch (err: unknown) {
      let errorMessage = "Registration failed. Please try again.";
      const detail = isAxiosError(err) ? (err.response?.data as { detail?: unknown } | undefined)?.detail : undefined;
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        const firstError = detail[0] as { msg?: unknown };
        if (typeof firstError.msg === 'string') {
          errorMessage = firstError.msg;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-8">
        <h2 className="mb-2 text-3xl font-bold text-slate-100">Create Account</h2>
        <p className="text-sm text-slate-400">Start analyzing resumes and comparing candidate skills.</p>
      </div>
      
      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm font-medium text-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
            <label htmlFor="register-full-name" className="text-sm font-medium text-slate-100">Full Name</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="register-full-name"
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition-all"
              placeholder="Jane Doe"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
            <label htmlFor="register-email" className="text-sm font-medium text-slate-100">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="register-email"
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
            <label htmlFor="register-password" className="text-sm font-medium text-slate-100">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="register-password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition-all"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character.</p>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#2563EB] py-2.5 font-semibold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-70"
        >
          {isLoading ? (
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        Already have an account? <Link to="/login" className="text-[#4F46E5] hover:underline font-medium">Log in</Link>
      </div>
    </div>
  );
}
