import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { LayoutDashboard, CheckSquare, Flag, Users, Megaphone, Scale, FileText } from "lucide-react";
import { mockClubs, mockEvents, mockReports, mockApprovals } from "../../data/mockData";

const sidebarItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2"/> },
    { label: "Club Approvals", path: "/admin/club-approvals", icon: <CheckSquare className="w-4 h-4 mr-2"/> },
    { label: "Reports & Moderation", path: "/admin/reports", icon: <Flag className="w-4 h-4 mr-2"/> },
    { label: "Club Management", path: "/admin/club-management", icon: <Users className="w-4 h-4 mr-2"/> },
    { label: "Announcements", path: "/admin/announcements", icon: <Megaphone className="w-4 h-4 mr-2"/> },
    { label: "Appeals", path: "/admin/appeals", icon: <Scale className="w-4 h-4 mr-2"/> },
    { label: "Export Reports", path: "/admin/export", icon: <FileText className="w-4 h-4 mr-2"/> },
];

export default function AdminDashboard() {
    const totalClubs = mockClubs.length;
    const pendingApprovals = mockApprovals.filter((a) => a.status === "pending").length;
    const activeEvents = mockEvents.length;
    const openReports = mockReports.filter((r) => r.status === "new").length;

    return (
        <DashboardLayout role="admin" userName="Dr. Abdullah Al-Mutairi" sidebarItems={sidebarItems}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here's what's happening on the platform.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-primary"/>
                            </div>
                        </div>
                        <div className="text-3xl font-bold mb-1">{totalClubs}</div>
                        <div className="text-sm text-muted-foreground">Total Clubs</div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                <CheckSquare className="w-6 h-6 text-amber-600"/>
                            </div>
                        </div>
                        <div className="text-3xl font-bold mb-1">{pendingApprovals}</div>
                        <div className="text-sm text-muted-foreground">Pending Approvals</div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600"/>
                            </div>
                        </div>
                        <div className="text-3xl font-bold mb-1">{activeEvents}</div>
                        <div className="text-sm text-muted-foreground">Active Events</div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                                <Flag className="w-6 h-6 text-red-600"/>
                            </div>
                        </div>
                        <div className="text-3xl font-bold mb-1">{openReports}</div>
                        <div className="text-sm text-muted-foreground">Open Reports</div>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Recent Club Approvals</h2>
                        <div className="space-y-4">
                            {mockApprovals.slice(0, 3).map((approval) => (
                                <div key={approval.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                                    <div>
                                        <div className="font-medium">{approval.clubName}</div>
                                        <div className="text-sm text-muted-foreground">{approval.category}</div>
                                    </div>
                                    <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                                        Pending
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
                        <div className="space-y-4">
                            {mockReports.map((report) => (
                                <div key={report.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                                    <div>
                                        <div className="font-medium">{report.targetName}</div>
                                        <div className="text-sm text-muted-foreground">{report.reason}</div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs ${
                                        report.severity === "high"
                                            ? "bg-red-100 text-red-800"
                                            : report.severity === "medium"
                                                ? "bg-amber-100 text-amber-800"
                                                : "bg-blue-100 text-blue-800"
                                    }`}>
                                        {report.severity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Active Clubs Summary */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Active Clubs Summary</h2>
                    <div className="space-y-3">
                        {mockClubs.slice(0, 5).map((club) => (
                            <div key={club.id} className="flex items-center justify-between pb-3 border-b last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-xl">
                                        {club.logo}
                                    </div>
                                    <div>
                                        <div className="font-medium">{club.name}</div>
                                        <div className="text-sm text-muted-foreground">{club.category}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-sm text-muted-foreground">
                                        {club.members} members
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs ${
                                        club.status === "active"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    }`}>
                                        {club.status || "active"}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
