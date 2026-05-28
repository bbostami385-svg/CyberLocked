import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Lock, Mail, User, Building2, CheckCircle } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Register() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError("Please enter your full name");
      return false;
    }
    if (!formData.email) {
      setError("Please enter your email");
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.agreeTerms) {
      setError("Please agree to the terms and conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      // For now, show success and redirect to login
      setSuccess(true);
      setTimeout(() => {
        setLocation("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800 border-slate-700 p-8 text-center max-w-md">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-slate-400 mb-6">
            Your account has been successfully created. Redirecting to login...
          </p>
          <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
            Redirecting...
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CyberLocked</h1>
          <p className="text-slate-400">Create Your Security Account</p>
        </div>

        {/* Register Card */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Company Input */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Company (Optional)
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  name="company"
                  placeholder="Your Company"
                  value={formData.company}
                  onChange={handleChange}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
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
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Min 8 characters</p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start text-sm text-slate-400 hover:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mr-2 mt-1"
              />
              <span>
                I agree to the{" "}
                <a href="#" className="text-cyan-500 hover:text-cyan-400">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-cyan-500 hover:text-cyan-400">
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* Register Button */}
            <Button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Card>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-slate-400">
            Already have an account?{" "}
            <a href="/login" className="text-cyan-500 hover:text-cyan-400 font-semibold">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
