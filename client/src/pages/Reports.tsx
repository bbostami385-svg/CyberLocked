import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileText } from "lucide-react";

export default function Reports() {
  const { data: recentScans, isLoading } = trpc.scans.recent.useQuery();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Security Reports</h1>
        <p className="text-muted-foreground mt-2">Download comprehensive security scan reports</p>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </>
        ) : recentScans && recentScans.length > 0 ? (
          recentScans.map((scan: any) => (
            <Card key={scan.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <CardTitle>Scan Report #{scan.id}</CardTitle>
                      <CardDescription>
                        {new Date(scan.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{
                        backgroundColor:
                          scan.overallSeverity === "critical"
                            ? "#dc2626"
                            : scan.overallSeverity === "high"
                              ? "#ea580c"
                              : "#f59e0b",
                      }}
                    >
                      {scan.overallSeverity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm">
                      <strong>{scan.vulnerabilityCount}</strong> vulnerabilities found
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Risk Score: {scan.riskScore}/100
                    </p>
                  </div>
                  <Button className="gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No reports available yet. Run a scan to generate a report.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
