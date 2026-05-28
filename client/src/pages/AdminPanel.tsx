import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Settings, BarChart3, Trash2, Edit, Plus, Mail, Shield } from "lucide-react";

export default function AdminPanel() {
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", role: "admin", status: "active", joinDate: "2026-01-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "analyst", status: "active", joinDate: "2026-02-20" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "analyst", status: "inactive", joinDate: "2026-03-10" },
  ]);

  const [newMember, setNewMember] = useState({ email: "", role: "analyst" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddMember = () => {
    if (newMember.email) {
      setTeamMembers([
        ...teamMembers,
        {
          id: teamMembers.length + 1,
          name: newMember.email.split("@")[0],
          email: newMember.email,
          role: newMember.role as "admin" | "analyst",
          status: "active",
          joinDate: new Date().toISOString().split("T")[0],
        },
      ]);
      setNewMember({ email: "", role: "analyst" });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteMember = (id: number) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
  };

  const getRoleColor = (role: string) => {
    return role === "admin" ? "bg-purple-500 text-white" : "bg-blue-500 text-white";
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-500 text-white" : "bg-slate-500 text-white";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-slate-400">Manage team, settings, and platform configuration</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-sm mb-1">Total Scans</div>
                <div className="text-3xl font-bold text-white">1,247</div>
              </div>
              <BarChart3 className="w-8 h-8 text-cyan-500" />
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-sm mb-1">Team Members</div>
                <div className="text-3xl font-bold text-white">{teamMembers.length}</div>
              </div>
              <Users className="w-8 h-8 text-cyan-500" />
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-sm mb-1">Vulnerabilities Found</div>
                <div className="text-3xl font-bold text-white">342</div>
              </div>
              <Shield className="w-8 h-8 text-cyan-500" />
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-400 text-sm mb-1">Critical Issues</div>
                <div className="text-3xl font-bold text-red-500">12</div>
              </div>
              <Settings className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="team" className="w-full">
          <TabsList className="bg-slate-700 mb-6">
            <TabsTrigger value="team">Team Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          </TabsList>

          {/* Team Management Tab */}
          <TabsContent value="team">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Team Members</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-cyan-500 hover:bg-cyan-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Invite Team Member</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Send an invitation to join your security team
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-2">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          placeholder="member@example.com"
                          value={newMember.email}
                          onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-2">
                          Role
                        </label>
                        <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="analyst">Analyst</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleAddMember}
                        className="w-full bg-cyan-500 hover:bg-cyan-600"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Invitation
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Team Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Name</TableHead>
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Role</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Join Date</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell className="text-white font-medium">{member.name}</TableCell>
                        <TableCell className="text-slate-400">{member.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(member.role)}>
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400">{member.joinDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-slate-600 hover:bg-slate-700">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 hover:bg-red-500/10"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-slate-800 border-slate-700 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Platform Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Organization Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Your Organization"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Email Notifications
                    </label>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-slate-300">Send notifications for critical vulnerabilities</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Scan Frequency
                    </label>
                    <Select defaultValue="weekly">
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="bg-cyan-500 hover:bg-cyan-600">Save Settings</Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="logs">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Audit Logs</h3>
              <div className="space-y-3">
                {[
                  { action: "Scan Started", user: "John Doe", time: "2 hours ago", status: "completed" },
                  { action: "User Added", user: "Jane Smith", time: "1 day ago", status: "success" },
                  { action: "Settings Updated", user: "Admin", time: "3 days ago", status: "success" },
                  { action: "Report Downloaded", user: "Mike Johnson", time: "5 days ago", status: "success" },
                ].map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{log.action}</div>
                      <div className="text-sm text-slate-400">by {log.user}</div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-500 text-white mb-1">{log.status}</Badge>
                      <div className="text-sm text-slate-400">{log.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
