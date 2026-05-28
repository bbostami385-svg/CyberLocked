import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Shield, Zap, BarChart3, Lock, AlertTriangle, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-bold text-white">CyberLocked</span>
          </div>
          <a href={getLoginUrl()}>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">Sign In</Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Enterprise-Grade Security
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Scanning & Protection
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Identify vulnerabilities, analyze threats, and harden your security posture with
            AI-powered insights. Protect your websites, applications, and infrastructure.
          </p>
          <div className="flex gap-4 justify-center">
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                Get Started Free
              </Button>
            </a>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-800"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {[
            {
              icon: Shield,
              title: "Vulnerability Scanning",
              description: "Detect SQL injection, XSS, weak SSL, and 100+ vulnerability types",
            },
            {
              icon: Zap,
              title: "Real-Time Analysis",
              description: "AI-powered analysis generates actionable recommendations instantly",
            },
            {
              icon: BarChart3,
              title: "Comprehensive Reports",
              description: "Professional PDF reports with risk scores and remediation steps",
            },
            {
              icon: Lock,
              title: "Continuous Monitoring",
              description: "Schedule automated scans to monitor security posture 24/7",
            },
            {
              icon: AlertTriangle,
              title: "Threat Detection",
              description: "Identify malware signatures and suspicious patterns in real-time",
            },
            {
              icon: CheckCircle,
              title: "Team Collaboration",
              description: "Manage team members with role-based access control",
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors"
              >
                <Icon className="w-8 h-8 text-cyan-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-800/50 border-y border-slate-700/50 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Vulnerabilities Detected", value: "10,000+" },
              { label: "Active Targets", value: "500+" },
              { label: "Security Scans", value: "50,000+" },
              { label: "Teams Protected", value: "100+" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-cyan-400 mb-2">{stat.value}</div>
                <div className="text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Start Protecting Your Assets Today
        </h2>
        <p className="text-xl text-slate-400 mb-8">
          Join teams worldwide securing their digital infrastructure with CyberLocked
        </p>
        <a href={getLoginUrl()}>
          <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white">
            Sign In Now
          </Button>
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>&copy; 2026 CyberLocked. All rights reserved. Enterprise Security Platform.</p>
        </div>
      </footer>
    </div>
  );
}
