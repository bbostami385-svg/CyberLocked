import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Globe, Zap, Clock, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ScanForm() {
  const [activeTab, setActiveTab] = useState("url");
  const [target, setTarget] = useState("");
  const [scanName, setScanName] = useState("");
  const [scanType, setScanType] = useState("quick");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanSubmitted, setScanSubmitted] = useState(false);

  const createScanMutation = trpc.targets.create.useMutation();

  const validateTarget = () => {
    if (!target.trim()) {
      toast.error("Please enter a target");
      return false;
    }

    if (activeTab === "url") {
      try {
        new URL(target);
        return true;
      } catch {
        toast.error("Invalid URL format");
        return false;
      }
    } else if (activeTab === "ip") {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(target)) {
        toast.error("Invalid IP address format");
        return false;
      }
      return true;
    } else if (activeTab === "domain") {
      const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
      if (!domainRegex.test(target)) {
        toast.error("Invalid domain format");
        return false;
      }
      return true;
    }

    return true;
  };

  const handleSubmitScan = async () => {
    if (!validateTarget()) return;

    setIsSubmitting(true);
    try {
      await createScanMutation.mutateAsync({
        targetUrl: target,
        name: scanName || `${activeTab.toUpperCase()} Scan`,
        targetType: activeTab as "url" | "ip" | "domain",
      });

      setScanSubmitted(true);
      toast.success("Scan submitted successfully!");

      setTimeout(() => {
        setTarget("");
        setScanName("");
        setScanSubmitted(false);
      }, 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit scan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (scanSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Scan Submitted!</h2>
            <p className="text-slate-400 mb-6">
              Your security scan has been queued and will start shortly. You'll receive notifications as the scan progresses.
            </p>
            <Button
              onClick={() => setScanSubmitted(false)}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              Submit Another Scan
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Start Security Scan</h1>
          <p className="text-slate-400">
            Scan your website, application, or infrastructure for vulnerabilities
          </p>
        </div>

        {/* Scan Form Card */}
        <Card className="bg-slate-800 border-slate-700 p-8">
          {/* Target Type Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger value="url" className="data-[state=active]:bg-cyan-500">
                <Globe className="w-4 h-4 mr-2" />
                URL
              </TabsTrigger>
              <TabsTrigger value="ip" className="data-[state=active]:bg-cyan-500">
                <Zap className="w-4 h-4 mr-2" />
                IP Address
              </TabsTrigger>
              <TabsTrigger value="domain" className="data-[state=active]:bg-cyan-500">
                <Globe className="w-4 h-4 mr-2" />
                Domain
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Website URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  disabled={isSubmitting}
                />
              </div>
            </TabsContent>

            <TabsContent value="ip" className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  IP Address
                </label>
                <Input
                  type="text"
                  placeholder="192.168.1.1"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  disabled={isSubmitting}
                />
              </div>
            </TabsContent>

            <TabsContent value="domain" className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Domain Name
                </label>
                <Input
                  type="text"
                  placeholder="example.com"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  disabled={isSubmitting}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Scan Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Scan Name (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g., Production Environment Scan"
              value={scanName}
              onChange={(e) => setScanName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              disabled={isSubmitting}
            />
          </div>

          {/* Scan Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-200 mb-3">
              Scan Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: "quick", name: "Quick Scan", time: "5-10 min" },
                { id: "full", name: "Full Scan", time: "30-60 min" },
                { id: "custom", name: "Custom Scan", time: "Variable" },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setScanType(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    scanType === type.id
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-slate-600 bg-slate-700 hover:border-slate-500"
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="font-semibold text-white">{type.name}</div>
                  <div className="text-sm text-slate-400 flex items-center justify-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {type.time}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info Alert */}
          <Alert className="mb-6 bg-slate-700 border-slate-600">
            <AlertCircle className="h-4 w-4 text-cyan-500" />
            <AlertDescription className="text-slate-300">
              Scans are performed in real-time. You'll receive notifications as vulnerabilities are discovered.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitScan}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3"
            disabled={isSubmitting || !target}
          >
            {isSubmitting ? "Submitting Scan..." : "Start Security Scan"}
          </Button>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: "🔍", title: "100+ Checks", desc: "Comprehensive vulnerability detection" },
            { icon: "⚡", title: "Real-time", desc: "Instant results and notifications" },
            { icon: "📊", title: "Detailed Report", desc: "AI-powered analysis and fixes" },
          ].map((feature, idx) => (
            <Card key={idx} className="bg-slate-800 border-slate-700 p-4 text-center">
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h3 className="font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
