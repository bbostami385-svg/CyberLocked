import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, UserCheck } from "lucide-react";

export default function TeamManagement() {
  // Mock team data - in production this would come from an API
  const teamMembers = [
    {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      status: "active",
      joinedAt: "2026-01-01",
    },
    {
      id: 2,
      name: "Security Analyst",
      email: "analyst@example.com",
      role: "analyst",
      status: "active",
      joinedAt: "2026-02-15",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground mt-2">Manage team members and their roles</p>
        </div>
        <Button>Invite Member</Button>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter((m) => m.role === "admin").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Analysts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter((m) => m.role === "analyst").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage your team's access and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={member.role === "admin" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {member.role === "admin" ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3 h-3 mr-1" />
                        Analyst
                      </>
                    )}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Role
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Full access to all features including:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Create and manage scan targets</li>
              <li>Run and schedule scans</li>
              <li>View all reports and analytics</li>
              <li>Manage team members</li>
              <li>Configure system settings</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Analyst Role
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Limited access for security analysis:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>View assigned scan targets</li>
              <li>Run scans (cannot schedule)</li>
              <li>View reports and recommendations</li>
              <li>Cannot manage team members</li>
              <li>Cannot modify system settings</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
