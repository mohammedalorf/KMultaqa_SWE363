import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { LayoutDashboard, CheckSquare, Flag, Users, Megaphone, Scale, FileText, Settings, Check, X, Eye, } from "lucide-react";
import { useState } from "react";
import { mockApprovals } from "../../data/mockData";
import { toast } from "sonner";

const sidebarItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2"/> },
  { label: "Club Approvals", path: "/admin/club-approvals", icon: <CheckSquare className="w-4 h-4 mr-2"/> },
  { label: "Reports", path: "/admin/reports", icon: <Flag className="w-4 h-4 mr-2"/> },
  { label: "Club Management", path: "/admin/club-management", icon: <Users className="w-4 h-4 mr-2"/> },
  { label: "Announcements", path: "/admin/announcements", icon: <Megaphone className="w-4 h-4 mr-2"/> },
  { label: "Appeals", path: "/admin/appeals", icon: <Scale className="w-4 h-4 mr-2"/> },
  { label: "Export Reports", path: "/admin/export", icon: <FileText className="w-4 h-4 mr-2"/> },
  { label: "Settings", path: "/admin/settings", icon: <Settings className="w-4 h-4 mr-2"/> },
];

export default function ClubApprovals() {
  const [approvals, setApprovals] = useState(mockApprovals);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleViewDetails = (approval) => {
    setSelectedApproval(approval);
    setShowDetailsDialog(true);
  };

  const handleApprove = () => {
    if (selectedApproval) {
      setApprovals(approvals.map((a) => a.id === selectedApproval.id ? { ...a, status: "approved" } : a));
      toast.success(`${selectedApproval.clubName} has been approved!`);
      setShowDetailsDialog(false);
      setSelectedApproval(null);
    }
  };

  const handleRejectClick = () => {
    setShowDetailsDialog(false);
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = () => {
    if (selectedApproval && rejectReason.trim()) {
      setApprovals(approvals.map((a) => a.id === selectedApproval.id
        ? { ...a, status: "rejected", note: rejectReason }
        : a));
      toast.success(`${selectedApproval.clubName} has been rejected.`);
      setShowRejectDialog(false);
      setSelectedApproval(null);
      setRejectReason("");
    }
  };

  return (
    <DashboardLayout role="admin" userName="Dr. Abdullah Al-Mutairi" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Club Approval Requests</h1>
          <p className="text-muted-foreground">Review and approve or reject club registration requests</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold">
              {approvals.filter((a) => a.status === "pending").length}
            </div>
            <div className="text-sm text-muted-foreground">Pending Requests</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">
              {approvals.filter((a) => a.status === "approved").length}
            </div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">
              {approvals.filter((a) => a.status === "rejected").length}
            </div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </Card>
        </div>

        {/* Approvals Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold">Club Name</th>
                  <th className="text-left p-4 font-semibold">Category</th>
                  <th className="text-left p-4 font-semibold">Officers</th>
                  <th className="text-left p-4 font-semibold">Submitted</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((approval) => (
                  <tr key={approval.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium">{approval.clubName}</td>
                    <td className="p-4 text-muted-foreground">{approval.category}</td>
                    <td className="p-4 text-muted-foreground">{approval.officers.length} officers</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(approval.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Badge variant={approval.status === "approved"
                        ? "default"
                        : approval.status === "rejected"
                          ? "destructive"
                          : "secondary"}>
                        {approval.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(approval)}>
                        <Eye className="w-4 h-4 mr-1"/>
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

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Club Approval Request Details</DialogTitle>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4">
              <div>
                <Label>Club Name</Label>
                <div className="text-lg font-semibold">{selectedApproval.clubName}</div>
              </div>
              <div>
                <Label>Category</Label>
                <div>{selectedApproval.category}</div>
              </div>
              <div>
                <Label>Officers</Label>
                <ul className="list-disc list-inside space-y-1">
                  {selectedApproval.officers.map((officer, idx) => (
                    <li key={idx}>{officer}</li>
                  ))}
                </ul>
              </div>
              <div>
                <Label>Submitted Documents</Label>
                <div className="space-y-2 mt-2">
                  {selectedApproval.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-accent rounded-lg">
                      <FileText className="w-4 h-4"/>
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Submitted Date</Label>
                <div>{new Date(selectedApproval.submittedAt).toLocaleDateString()}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedApproval?.status === "pending" && (
              <>
                <Button variant="outline" onClick={handleRejectClick}>
                  <X className="w-4 h-4 mr-2"/>
                  Reject
                </Button>
                <Button onClick={handleApprove}>
                  <Check className="w-4 h-4 mr-2"/>
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Club Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea id="reason" placeholder="Please provide a reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4}/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm} disabled={!rejectReason.trim()}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}