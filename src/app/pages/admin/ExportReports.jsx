import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { LayoutDashboard, CheckSquare, Flag, Users, Megaphone, Scale, FileText, Settings, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const sidebarItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
  { label: "Club Approvals", path: "/admin/club-approvals", icon: <CheckSquare className="w-4 h-4 mr-2" /> },
  { label: "Reports", path: "/admin/reports", icon: <Flag className="w-4 h-4 mr-2" /> },
  { label: "Club Management", path: "/admin/club-management", icon: <Users className="w-4 h-4 mr-2" /> },
  { label: "Announcements", path: "/admin/announcements", icon: <Megaphone className="w-4 h-4 mr-2" /> },
  { label: "Appeals", path: "/admin/appeals", icon: <Scale className="w-4 h-4 mr-2" /> },
  { label: "Export Reports", path: "/admin/export", icon: <FileText className="w-4 h-4 mr-2" /> },
  { label: "Settings", path: "/admin/settings", icon: <Settings className="w-4 h-4 mr-2" /> }
];

const SIZE_LIMIT = 5000;
const BASE_MULTIPLIER = {
  clubs: 12,
  events: 18,
  reports: 25,
  registrations: 35,
  users: 30
};

function getDaysBetween(dateFrom, dateTo) {
  if (!dateFrom || !dateTo) return 30;
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  return Math.floor((to - from) / (24 * 60 * 60 * 1000)) + 1;
}

export default function ExportReports() {
  const [reportType, setReportType] = useState("clubs");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("all");
  const [format, setFormat] = useState("csv");

  const estimatedRows = useMemo(() => {
    const days = getDaysBetween(dateFrom, dateTo);
    return Math.max(1, days) * (BASE_MULTIPLIER[reportType] || 15);
  }, [dateFrom, dateTo, reportType]);

  const handleExport = () => {
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      toast.error("Invalid date range: Date From must be before or equal to Date To.");
      return;
    }

    if (estimatedRows > SIZE_LIMIT) {
      toast.error(`Export too large (~${estimatedRows} rows). Narrow filters/date range and try again.`);
      return;
    }

    toast.success(`${reportType} report exported as ${format.toUpperCase()} (${estimatedRows} rows)`);
  };

  const handleDownload = (fileName) => {
    toast.info(`${fileName} download not available in demo mode.`);
  };

  return (
    <DashboardLayout role="admin" userName="Dr. Abdullah Al-Mutairi" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Export Reports</h1>
          <p className="text-muted-foreground">Generate and export reports for clubs, events, and moderation activities</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Configure Export</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clubs">Clubs List</SelectItem>
                    <SelectItem value="events">Events List</SelectItem>
                    <SelectItem value="reports">Moderation Reports</SelectItem>
                    <SelectItem value="registrations">Event Registrations</SelectItem>
                    <SelectItem value="users">User Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFrom">Date From</Label>
                  <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="dateTo">Date To</Label>
                  <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
              </div>

              {dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo) && (
                <p className="text-sm text-red-600">Date range is invalid: Date From must be before Date To.</p>
              )}

              <div>
                <Label htmlFor="status">Filter by Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="format">Export Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                    <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="p-3 bg-accent/40">
                <div className="text-sm">Estimated export size: ~{estimatedRows} rows</div>
                <div className="text-xs text-muted-foreground">
                  Exports above {SIZE_LIMIT} rows are blocked. Narrow date range or filters.
                </div>
              </Card>

              <Button onClick={handleExport} className="w-full" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Generate & Export Report
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Exports</h2>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">Clubs Report</div>
                <div className="text-xs text-muted-foreground">CSV</div>
              </div>
              <div className="text-xs text-muted-foreground mb-3">Exported: Feb 18, 2026</div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownload("Clubs Report")}>
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">Events Report</div>
                <div className="text-xs text-muted-foreground">PDF</div>
              </div>
              <div className="text-xs text-muted-foreground mb-3">Exported: Feb 15, 2026</div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownload("Events Report")}>
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">Reports List</div>
                <div className="text-xs text-muted-foreground">CSV</div>
              </div>
              <div className="text-xs text-muted-foreground mb-3">Exported: Feb 10, 2026</div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownload("Reports List")}>
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
