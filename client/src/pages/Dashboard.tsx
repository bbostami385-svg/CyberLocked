import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, Clock, Target, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: activity, isLoading: activityLoading } = trpc.dashboard.recentActivity.useQuery();

  const severityColors = {
    critical: "#dc2626",
    high: "#ea580c",
    medium: "#f59e0b",
    low: "#3b82f6",
    info: "#6b7280",
  };

  const pieData = stats
    ? [
        { name: "Critical", value: 0 },
        { name: "High", value: 0 },
        { name: "Medium", value: 0 },
        { name: "Low", value: 0 },
      ]
    : [];

  const chartData = [
    { name: "Mon", scans: 12, vulnerabilities: 24 },
    { name: "Tue", scans: 19, vulnerabilities: 38 },
    { name: "Wed", scans: 15, vulnerabilities: 28 },
    { name: "Thu", scans: 22, vulnerabilities: 45 },
    { name: "Fri", scans: 18, vulnerabilities: 35 },
    { name: "Sat", scans: 10, vulnerabilities: 20 },
    { name: "Sun", scans: 14, vulnerabilities: 28 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Security Dashboard</h1>
        <p className="text-muted-foreground mt-2">Real-time overview of your security posture</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Targets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalTargets || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeTargets || 0} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recent Scans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.recentScans || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.completedScans || 0} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Critical Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats?.criticalVulnerabilities || 0}
                </div>
                <p className="text-xs text-muted-foreground">Require immediate action</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Risk Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.averageRiskScore || "0"}</div>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Failed Scans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.failedScans || 0}
                </div>
                <p className="text-xs text-muted-foreground">Review errors</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Scan Activity (7 Days)</CardTitle>
            <CardDescription>Scans and vulnerabilities detected over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="scans" fill="#0ea5e9" />
                <Bar dataKey="vulnerabilities" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
            <CardDescription>Vulnerability breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Critical", value: 12 },
                    { name: "High", value: 28 },
                    { name: "Medium", value: 45 },
                    { name: "Low", value: 15 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#dc2626" />
                  <Cell fill="#ea580c" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest scans and security events</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : activity && activity.length > 0 ? (
            <div className="space-y-4">
              {activity.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {item.severity === "critical" ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {item.status === "completed" ? "Scan Completed" : "Scan In Progress"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{
                        backgroundColor:
                          item.severity === "critical"
                            ? "#dc2626"
                            : item.severity === "high"
                              ? "#ea580c"
                              : "#f59e0b",
                      }}
                    >
                      {item.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
