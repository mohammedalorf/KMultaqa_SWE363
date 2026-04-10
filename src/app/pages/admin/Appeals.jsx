import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { LayoutDashboard, CheckSquare, Flag, Users, Megaphone, Scale, FileText, Settings, Eye, Check, X, Wrench } from "lucide-react";
import { useState } from "react";
import { mockAppeals } from "../../data/mockData";
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

export default function Appeals() {
  const [appeals, setAppeals] = useState(mockAppeals);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [explanation, setExplanation] = useState("");

  const handleViewAppeal = (appeal) => {
    setSelectedAppeal(appeal);
    setShowDetailsDialog(true);
  };

  const handleDecision = (decision) => {
    if (!selectedAppeal || !explanation.trim()) return;

    setAppeals((prev) => prev.map((a) => (a.id === selectedAppeal.id ? { ...a, status: decision, adminExplanation: explanation.trim() } : a)));

    const label = decision === "overturned" ? "overturned" : decision === "modified" ? "modified" : "upheld";
    toast.success(`Appeal ${label} successfully`);
    setShowDetailsDialog(false);
    setSelectedAppeal(null);
    setExplanation("");
  };

  return (
    <DashboardLayout role="admin" userName="Dr. Abdullah Al-Mutairi" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Appeals Management</h1>
          <p className="text-muted-foreground">Review and handle appeal requests from clubs</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold">{appeals.filter((a) => a.status === "pending").length}</div>
            <div className="text-sm text-muted-foreground">Pending Appeals</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">{appeals.filter((a) => a.status === "upheld").length}</div>
            <div className="text-sm text-muted-foreground">Upheld</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">{appeals.filter((a) => a.status === "overturned").length}</div>
            <div className="text-sm text-muted-foreground">Overturned</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">{appeals.filter((a) => a.status === "modified").length}</div>
            <div className="text-sm text-muted-foreground">Modified</div>
          </Card>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold">Type</th>
                  <th className="text-left p-4 font-semibold">Submitted By</th>
                  <th className="text-left p-4 font-semibold">Original Decision</th>
                  <th className="text-left p-4 font-semibold">Date</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appeals.map((appeal) => (
                  <tr key={appeal.id} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <Badge variant="outline">{appeal.type === "club-rejection" ? "Club Rejection" : "Moderation Action"}</Badge>
                    </td>
                    <td className="p-4 font-medium">{appeal.submittedBy}</td>
                    <td className="p-4 text-muted-foreground">{appeal.originalDecision.substring(0, 50)}...</td>
                    <td className="p-4 text-muted-foreground">{new Date(appeal.submittedAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <Badge variant={appeal.status === "pending" ? "secondary" : appeal.status === "overturned" ? "default" : "outline"}>
                        {appeal.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm" onClick={() => handleViewAppeal(appeal)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Review
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
            <DialogTitle>Appeal Review</DialogTitle>
          </DialogHeader>
          {selectedAppeal && (
            <div className="space-y-4">
              <div>
                <Label>Appeal Type</Label>
                <div className="font-medium">{selectedAppeal.type === "club-rejection" ? "Club Rejection Appeal" : "Moderation Action Appeal"}</div>
              </div>
              <div>
                <Label>Submitted By</Label>
                <div>{selectedAppeal.submittedBy}</div>
              </div>
              <div>
                <Label>Original Decision</Label>
                <div className="p-3 bg-accent rounded-lg">{selectedAppeal.originalDecision}</div>
              </div>
              <div>
                <Label>New Evidence / Justification</Label>
                <div className="p-3 bg-accent rounded-lg">{selectedAppeal.evidence}</div>
              </div>
              <div>
                <Label>Submitted Date</Label>
                <div>{new Date(selectedAppeal.submittedAt).toLocaleDateString()}</div>
              </div>
              <div>
                <Label htmlFor="explanation">Your Explanation (required)</Label>
                <Textarea id="explanation" placeholder="Provide an explanation for your decision..." value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={4} />
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedAppeal?.status === "pending" && (
              <>
                <Button variant="outline" onClick={() => handleDecision("upheld")} disabled={!explanation.trim()}>
                  <X className="w-4 h-4 mr-2" />
                  Uphold Original Decision
                </Button>
                <Button onClick={() => handleDecision("overturned")} disabled={!explanation.trim()}>
                  <Check className="w-4 h-4 mr-2" />
                  Overturn Decision
                </Button>
                <Button variant="secondary" onClick={() => handleDecision("modified")} disabled={!explanation.trim()}>
                  <Wrench className="w-4 h-4 mr-2" />
                  Modify Decision
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
