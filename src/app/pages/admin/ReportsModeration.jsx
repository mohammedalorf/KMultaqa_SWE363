import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { LayoutDashboard, CheckSquare, Flag, Users, Megaphone, Scale, FileText, Settings, AlertTriangle, Eye, Trash2, EyeOff, Ban, X } from "lucide-react";
import { useState } from "react";
import { mockReports } from "../../data/mockData";
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

const actionableStates = ["new", "in-review"];

export default function ReportsModeration() {
  const [reports, setReports] = useState(mockReports);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [actionNote, setActionNote] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [policyCategory, setPolicyCategory] = useState("");

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setActionNote("");
    setPolicyCategory("");
    setShowDetailsDialog(true);
  };

  const canApplyAction = selectedReport && actionableStates.includes(selectedReport.status);

  const handleAction = (action) => {
    if (!selectedReport) return;

    if (!actionableStates.includes(selectedReport.status)) {
      toast.error("Only reports in New or In Review state can be moderated.");
      return;
    }

    const requiresPolicyCategory = action === "Remove Post" || action === "Hide Content";
    if (requiresPolicyCategory && !policyCategory) {
      toast.error("Policy category is required for hide/remove actions.");
      return;
    }

    setReports((prev) =>
      prev.map((r) =>
        r.id === selectedReport.id
          ? {
              ...r,
              status: "resolved",
              moderationAction: action,
              moderationCategory: requiresPolicyCategory ? policyCategory : r.moderationCategory,
              moderationNote: actionNote.trim() || r.moderationNote
            }
          : r
      )
    );

    toast.success(`Action "${action}" applied successfully`);
    setShowDetailsDialog(false);
    setSelectedReport(null);
    setActionNote("");
    setPolicyCategory("");
  };

  const filteredReports = filterStatus === "all" ? reports : reports.filter((r) => r.status === filterStatus);

  return (
    <DashboardLayout role="admin" userName="Dr. Abdullah Al-Mutairi" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports & Moderation</h1>
          <p className="text-muted-foreground">Review and moderate reported content</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-red-600">{reports.filter((r) => r.status === "new").length}</div>
            <div className="text-sm text-muted-foreground">New Reports</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-amber-600">{reports.filter((r) => r.status === "in-review").length}</div>
            <div className="text-sm text-muted-foreground">In Review</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{reports.filter((r) => r.status === "resolved").length}</div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Label>Filter by Status:</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-review">In Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold">Type</th>
                  <th className="text-left p-4 font-semibold">Target</th>
                  <th className="text-left p-4 font-semibold">Reason</th>
                  <th className="text-left p-4 font-semibold">Severity</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Date</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <Badge variant="outline">{report.type}</Badge>
                    </td>
                    <td className="p-4 font-medium">{report.targetName}</td>
                    <td className="p-4 text-muted-foreground">{report.reason}</td>
                    <td className="p-4">
                      <Badge variant={report.severity === "high" ? "destructive" : report.severity === "medium" ? "default" : "secondary"}>
                        {report.severity}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={report.status === "resolved" ? "default" : "secondary"}>{report.status}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" onClick={() => handleViewReport(report)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Report Details</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailsDialog(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Report Type</Label>
                  <div className="font-medium capitalize">{selectedReport.type}</div>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Badge variant={selectedReport.severity === "high" ? "destructive" : selectedReport.severity === "medium" ? "default" : "secondary"}>
                    {selectedReport.severity}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="font-medium">{selectedReport.status}</div>
                {!canApplyAction && <p className="text-xs text-red-600 mt-1">Report state is not actionable. Only New/In Review can be moderated.</p>}
              </div>
              <div>
                <Label>Target Content/Club</Label>
                <div className="font-medium">{selectedReport.targetName}</div>
              </div>
              <div>
                <Label>Reported By</Label>
                <div>{selectedReport.reporterName}</div>
              </div>
              <div>
                <Label>Reason</Label>
                <div>{selectedReport.reason}</div>
              </div>
              <div>
                <Label>Comment</Label>
                <div className="p-3 bg-accent rounded-lg">{selectedReport.comment}</div>
              </div>
              <div>
                <Label htmlFor="policyCategory">Policy Category (required for Hide/Remove)</Label>
                <Select value={policyCategory} onValueChange={setPolicyCategory}>
                  <SelectTrigger id="policyCategory">
                    <SelectValue placeholder="Select policy category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="hate-speech">Hate Speech</SelectItem>
                    <SelectItem value="misinformation">Misinformation</SelectItem>
                    <SelectItem value="copyright">Copyright Violation</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="actionNote">Internal Note (optional)</Label>
                <Textarea id="actionNote" placeholder="Add any notes about your decision..." value={actionNote} onChange={(e) => setActionNote(e.target.value)} rows={3} />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => handleAction("Remove Post")} className="w-full sm:w-auto" disabled={!canApplyAction}>
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Post
            </Button>
            <Button variant="outline" onClick={() => handleAction("Hide Content")} className="w-full sm:w-auto" disabled={!canApplyAction}>
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Content
            </Button>
            <Button variant="outline" onClick={() => handleAction("Warn Club")} className="w-full sm:w-auto" disabled={!canApplyAction}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Warn Club
            </Button>
            <Button variant="destructive" onClick={() => handleAction("Suspend Club") } className="w-full sm:w-auto" disabled={!canApplyAction}>
              <Ban className="w-4 h-4 mr-2" />
              Suspend Club
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
