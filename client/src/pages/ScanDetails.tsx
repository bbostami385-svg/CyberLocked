import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Download, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ScanDetails() {
  const [, params] = useRoute("/scan/:id");
  const scanId = params?.id ? parseInt(params.id) : null;

  const { data: scan, isLoading: scanLoading } = trpc.scans.get.useQuery(
    { id: scanId! },
    { enabled: !!scanId }
  );

  const { data: vulnerabilities, isLoading: vulnLoading } = trpc.vulnerabilities.list.useQuery(
    { scanId: scanId! },
    { enabled: !!scanId }
  );

  const { data: recommendations, isLoading: recLoading } = trpc.recommendations.list.useQuery(
    { scanId: scanId! },
    { enabled: !!scanId }
  );

  const { data: report } = trpc.reports.get.useQuery(
    { scanId: scanId! },
    { enabled: !!scanId }
  );

  const severityColors: Record<string, string> = {
    critical: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-blue-100 text-blue-800",
    info: "bg-gray-100 text-gray-800",
  };

  if (scanLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12" />
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Scan not found</p>
      </div>
    );
  }

  const criticalCount = vulnerabilities?.filter((v: any) => v.severity === "critical").length || 0;
  const highCount = vulnerabilities?.filter((v: any) => v.severity === "high").length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Scan Results</h1>
          <p className="text-muted-foreground">
            {new Date(scan.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Status and Risk Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={scan.status === "completed" ? "default" : "secondary"}
              className="capitalize"
            >
              {scan.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{scan.riskScore}/100</div>
            <Badge className="mt-2 capitalize" variant="outline">
              {scan.overallSeverity}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Vulnerabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{scan.vulnerabilityCount}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {criticalCount} critical, {highCount} high
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Download */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Report</span>
              <a href={report.fileUrl || "#"}>
                <Button size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </a>
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="vulnerabilities">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vulnerabilities">
            Vulnerabilities ({vulnerabilities?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            Recommendations ({recommendations?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        {/* Vulnerabilities Tab */}
        <TabsContent value="vulnerabilities" className="space-y-4">
          {vulnLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </>
          ) : vulnerabilities && vulnerabilities.length > 0 ? (
            vulnerabilities.map((vuln: any) => (
              <Card key={vuln.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{vuln.title}</CardTitle>
                      <CardDescription className="mt-2">
                        Type: {vuln.type} | Location: {vuln.location}
                      </CardDescription>
                    </div>
                    <Badge className={severityColors[vuln.severity]}>
                      {vuln.severity.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{vuln.description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Recommendation</h4>
                    <p className="text-sm text-muted-foreground">{vuln.recommendation}</p>
                  </div>
                  {vuln.evidence && (
                    <div>
                      <h4 className="font-semibold mb-2">Evidence</h4>
                      <p className="text-sm text-muted-foreground">{vuln.evidence}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-muted-foreground">No vulnerabilities found</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {recLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </>
          ) : recommendations && recommendations.length > 0 ? (
            recommendations.map((rec: any) => (
              <Card key={rec.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      <CardDescription className="mt-2">
                        Category: {rec.category}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{rec.priority.toUpperCase()}</Badge>
                      <Badge variant="secondary">{rec.effort.toUpperCase()}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                  {rec.implementationSteps && rec.implementationSteps.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Implementation Steps</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        {rec.implementationSteps.map((step: string, i: number) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No recommendations available
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>AI Security Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {scan.aiAnalysis ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Executive Summary</h4>
                    <p className="text-muted-foreground">
                      {JSON.parse(scan.aiAnalysis).executiveSummary}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Risk Assessment</h4>
                    <p className="text-muted-foreground">
                      {JSON.parse(scan.aiAnalysis).riskAssessment}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Analysis pending...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
