import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { LayoutDashboard, CheckSquare, Flag, Users, Megaphone, Scale, FileText, Settings, Search, AlertTriangle, } from "lucide-react";
import { useState } from "react";
import { mockClubs } from "../../data/mockData";
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

export default function ClubManagement() {
  const [clubs, setClubs] = useState(mockClubs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClub, setSelectedClub] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [warningMessage, setWarningMessage] = useState("");

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChangeStatus = (club) => {
    setSelectedClub(club);
    setNewStatus(club.status);
    setShowStatusDialog(true);
  };

  const handleIssueWarning = (club) => {
    setSelectedClub(club);
    setShowWarningDialog(true);
  };

  const confirmStatusChange = () => {
    if (selectedClub && newStatus && statusReason.trim()) {
      setClubs(clubs.map((c) => c.id === selectedClub.id ? { ...c, status: newStatus } : c));
      toast.success(`Club status updated to ${newStatus}`);
      setShowStatusDialog(false);
      setSelectedClub(null);
      setStatusReason("");
    }
  };

  const confirmWarning = () => {
    if (selectedClub && warningMessage.trim()) {
      toast.success(`Warning sent to ${selectedClub.name}`);
      setShowWarningDialog(false);
      setSelectedClub(null);
      setWarningMessage("");
    }
  };

  return (
    <DashboardLayout role="admin" userName="Dr. Abdullah Al-Mutairi" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Club Management</h1>
          <p className="text-muted-foreground">Manage club accounts and their status</p>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground"/>
            <Input placeholder="Search clubs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1"/>
          </div>
        </Card>

        {/* Clubs List */}
        <div className="space-y-4">
          {filteredClubs.map((club) => (
            <Card key={club.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-3xl">
                    {club.logo}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{club.name}</h3>
                      <Badge variant={club.status === "active"
                        ? "default"
                        : club.status === "restricted"
                          ? "secondary"
                          : "destructive"}>
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
                  <Button variant="outline" size="sm" onClick={() => handleIssueWarning(club)}>
                    <AlertTriangle className="w-4 h-4 mr-1"/>
                    Issue Warning
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Change Status Dialog */}
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
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reason">Reason (required)</Label>
              <Textarea id="reason" placeholder="Provide a reason for this status change..." value={statusReason} onChange={(e) => setStatusReason(e.target.value)} rows={4}/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStatusChange} disabled={!statusReason.trim()}>
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Warning Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Warning to Club</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Club</Label>
              <div className="font-semibold">{selectedClub?.name}</div>
            </div>
            <div>
              <Label htmlFor="warningType">Warning Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select warning type"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="policy-violation">Policy Violation</SelectItem>
                  <SelectItem value="misconduct">Misconduct</SelectItem>
                  <SelectItem value="repeated-offense">Repeated Offense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="warning">Warning Message</Label>
              <Textarea id="warning" placeholder="Enter warning message..." value={warningMessage} onChange={(e) => setWarningMessage(e.target.value)} rows={4}/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarningDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmWarning} disabled={!warningMessage.trim()}>
              Send Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}