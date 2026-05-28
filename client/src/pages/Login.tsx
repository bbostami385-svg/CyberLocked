import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Lock, Mail } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleManuLogin = () => {
    window.location.href = getLoginUrl();
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError("Please enter both email and password");
        return;
      }

      // For now, redirect to Manus OAuth
      // In production, implement your own auth backend
      handleManuLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CyberLocked</h1>
          <p className="text-slate-400">Enterprise Security Platform</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-400 hover:text-slate-300 cursor-pointer">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <a href="#" className="text-cyan-500 hover:text-cyan-400">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
            </div>
          </div>

          {/* Manus OAuth Button */}
          <Button
            type="button"
            onClick={handleManuLogin}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2"
            disabled={isLoading}
          >
            Sign in with Manus
          </Button>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-slate-400">
            Don't have an account?{" "}
            <a href="/register" className="text-cyan-500 hover:text-cyan-400 font-semibold">
              Sign up
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-700 text-center text-xs text-slate-500">
          <p>Protected by enterprise-grade security</p>
          <p className="mt-2">© 2026 CyberLocked. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
