import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { LayoutDashboard, CheckSquare, Flag, Users, Megaphone, Scale, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { mockClubs } from "../../data/mockData";
import { toast } from "sonner";

const sidebarItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
  { label: "Club Approvals", path: "/admin/club-approvals", icon: <CheckSquare className="w-4 h-4 mr-2" /> },
  { label: "Reports", path: "/admin/reports", icon: <Flag className="w-4 h-4 mr-2" /> },
  { label: "Club Management", path: "/admin/club-management", icon: <Users className="w-4 h-4 mr-2" /> },
  { label: "Announcements", path: "/admin/announcements", icon: <Megaphone className="w-4 h-4 mr-2" /> },
  { label: "Appeals", path: "/admin/appeals", icon: <Scale className="w-4 h-4 mr-2" /> },
  { label: "Export Reports", path: "/admin/export", icon: <FileText className="w-4 h-4 mr-2" /> }
];

const transitionGuidance = {
  active: "Active clubs can access all features. Use when the club is compliant.",
  suspended: "Suspended clubs should be temporarily blocked from publishing and critical actions."
};

export default function ClubManagement() {
  const [clubs, setClubs] = useState(mockClubs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClub, setSelectedClub] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [statusReasonError, setStatusReasonError] = useState("");
  const [statusHistory, setStatusHistory] = useState(() =>
    mockClubs.reduce((acc, club) => {
      acc[club.id] = [
        {
          status: club.status,
          reason: "Initial state",
          changedAt: new Date().toISOString()
        }
      ];
      return acc;
    }, {})
  );

  const filteredClubs = useMemo(
    () => clubs.filter((club) => club.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [clubs, searchQuery]
  );

  const handleChangeStatus = (club) => {
    setSelectedClub(club);
    setNewStatus(club.status);
    setStatusReason("");
    setStatusReasonError("");
    setShowStatusDialog(true);
  };

  const confirmStatusChange = () => {
    if (!selectedClub || !newStatus) return;

    const reasonRequired = newStatus === "suspended";
    if (reasonRequired && !statusReason.trim()) {
      setStatusReasonError("Reason is required when suspending a club.");
      toast.error("Reason is required for suspended status.");
      return;
    }

    setClubs((prev) => prev.map((c) => (c.id === selectedClub.id ? { ...c, status: newStatus } : c)));
    setStatusHistory((prev) => ({
      ...prev,
      [selectedClub.id]: [
        {
          status: newStatus,
          reason: statusReason.trim() || "No reason provided",
          changedAt: new Date().toISOString()
        },
        ...(prev[selectedClub.id] || [])
      ]
    }));

    toast.success(`Club status updated to ${newStatus}`);
    setShowStatusDialog(false);
    setSelectedClub(null);
    setStatusReason("");
    setStatusReasonError("");
  };

  const selectedHistory = selectedClub ? statusHistory[selectedClub.id] || [] : [];

  return (
    <DashboardLayout role="admin" userName="Dr. Abdullah Al-Mutairi" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Club Management</h1>
          <p className="text-muted-foreground">Manage club accounts and their status</p>
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search clubs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
          </div>
        </Card>

        <div className="space-y-4">
          {filteredClubs.map((club) => (
            <Card key={club.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-3xl">{club.logo}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{club.name}</h3>
                      <Badge variant={club.status === "active" ? "default" : "destructive"}>
                        {club.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-2">{club.bio}</p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>Category: {club.category}</span>
                      <span>Followers: {club.followers}</span>
                      <span>Contact: {club.contact}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => handleChangeStatus(club)}>
                    Change Status
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Club Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Club</Label>
              <div className="font-semibold">{selectedClub?.name}</div>
            </div>
            <div>
              <Label>New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => {
                  setNewStatus(value);
                  if (value !== "suspended") {
                    setStatusReasonError("");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              {newStatus && <p className="text-xs text-muted-foreground mt-2">{transitionGuidance[newStatus]}</p>}
            </div>
            <div>
              <Label htmlFor="reason">Reason {newStatus === "suspended" ? "(required)" : "(optional)"}</Label>
              <Textarea
                id="reason"
                placeholder="Provide a reason for this status change..."
                value={statusReason}
                onChange={(e) => {
                  setStatusReason(e.target.value);
                  if (e.target.value.trim()) {
                    setStatusReasonError("");
                  }
                }}
                rows={3}
                className={statusReasonError ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {statusReasonError && <p className="mt-2 text-xs text-red-600">{statusReasonError}</p>}
            </div>
            <div>
              <Label>Status History</Label>
              <div className="max-h-36 overflow-y-auto border rounded-md p-3 space-y-2">
                {selectedHistory.map((item, idx) => (
                  <div key={`${item.changedAt}-${idx}`} className="text-xs border-b last:border-0 pb-2 last:pb-0">
                    <div className="font-medium capitalize">{item.status}</div>
                    <div className="text-muted-foreground">{new Date(item.changedAt).toLocaleString()}</div>
                    <div className="text-muted-foreground">Reason: {item.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
