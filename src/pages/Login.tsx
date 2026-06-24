import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";

import apiClient from "@/api/client";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        
        // Fetch user profile to get name
        try {
          const userResponse = await apiClient.get("/auth/me");
          if (userResponse.data?.full_name) {
            const fullName = userResponse.data.full_name;
            localStorage.setItem("userFirstName", fullName.split(' ')[0]);
            localStorage.setItem("userLastName", fullName.split(' ').slice(1).join(' '));
            window.dispatchEvent(new Event('profileUpdated'));
          }
        } catch (e) {
          console.error("Failed to fetch user profile", e);
        }

        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-zinc-900 mb-2">Welcome Back</h2>
        <p className="text-zinc-500 text-sm">Enter your credentials to access your workspace</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-500 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981] transition-all"
              placeholder="name@company.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-zinc-900">Password</label>
            <a href="#" className="text-xs text-[#10b981] hover:underline font-medium">Forgot password?</a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981] transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#10b981] to-[#3b82f6] text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 shadow-md transition-all mt-6 disabled:opacity-70"
        >
          {isLoading ? (
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {isLoading ? "Authenticating..." : "Initialize Session"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-500">
        Don't have an account? <Link to="/signup" className="text-[#10b981] hover:underline font-medium">Sign up</Link>
      </div>
    </div>
  );
}
