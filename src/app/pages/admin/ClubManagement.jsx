import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { Toolbar } from "../../components/layout/Toolbar";
import { EmptyState } from "../../components/layout/EmptyState";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { History, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../api/apiClient";
import { getAdminClubs, updateAdminClubStatus } from "../../api/adminApi";

const transitionGuidance = {
  active: "Active clubs can access all features. Use when the club is compliant.",
  suspended: "Suspended clubs are blocked from publishing and critical actions.",
};

function buildStatusTimeline(club) {
  if (!club) return [];

  const timeline = [];

  if (club.approvedAt) {
    timeline.push({
      label: "Approved",
      detail: "Club account was activated after admin approval.",
      date: club.approvedAt,
      tone: "success",
    });
  }

  timeline.push({
    label: club.status === "suspended" ? "Suspended" : "Active",
    detail:
      club.status === "suspended"
        ? club.suspensionReason || "Club is currently suspended."
        : "Club is currently active.",
    date: null,
    tone: club.status === "suspended" ? "destructive" : "success",
  });

  return timeline;
}

export default function ClubManagement() {
  const [clubs, setClubs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClub, setSelectedClub] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [statusReasonError, setStatusReasonError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadClubs() {
      setIsLoading(true);

      try {
        const { data } = await getAdminClubs();

        if (!cancelled) {
          setClubs(data.clubs || []);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error, "Could not load clubs."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadClubs();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredClubs = useMemo(
    () => clubs.filter((club) => club.clubName.toLowerCase().includes(searchQuery.toLowerCase())),
    [clubs, searchQuery]
  );

  const handleChangeStatus = (club) => {
    setSelectedClub(club);
    setNewStatus(club.status);
    setStatusReason(club.suspensionReason || "");
    setStatusReasonError("");
    setShowStatusDialog(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedClub || !newStatus) return;

    const reasonRequired = newStatus === "suspended";
    if (reasonRequired && !statusReason.trim()) {
      setStatusReasonError("Reason is required when suspending a club.");
      toast.error("Reason is required for suspended status.");
      return;
    }

    setIsSaving(true);

    try {
      const { data } = await updateAdminClubStatus(selectedClub.id, {
        status: newStatus,
        suspensionReason: statusReason.trim(),
      });

      setClubs((prev) => prev.map((club) => (club.id === selectedClub.id ? data.club : club)));
      toast.success(`Club status updated to ${newStatus}`);
      setShowStatusDialog(false);
      setSelectedClub(null);
      setStatusReason("");
      setStatusReasonError("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update club status."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageContainer>
        <PageHeader
          eyebrow="Management"
          title="Club Management"
          subtitle="Manage club accounts and their status."
        />

        <Toolbar>
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search clubs by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            {filteredClubs.length} of {clubs.length} clubs
          </div>
        </Toolbar>

        <Section title="All Clubs">
          {isLoading ? (
            <Card className="p-5 text-sm text-[var(--muted-foreground)]">Loading clubs...</Card>
          ) : filteredClubs.length === 0 ? (
            <EmptyState
              icon={<Users className="w-6 h-6" />}
              title="No clubs found"
              description="Try a different search term or approve a club request first."
            />
          ) : (
            <div className="grid gap-4">
              {filteredClubs.map((club) => (
                <Card key={club.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 bg-[var(--accent)] rounded-full flex items-center justify-center overflow-hidden font-semibold text-[var(--primary)] text-xl shrink-0">
                        {club.logoUrl ? (
                          <img src={club.logoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          club.clubName?.charAt(0) || "C"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold truncate">{club.clubName}</h3>
                          <Badge variant={club.status === "active" ? "success" : "destructive"}>
                            {club.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] mb-2 line-clamp-2">{club.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
                          <span className="capitalize">Category: {club.category}</span>
                          <span>Followers: {club.followers}</span>
                          <span>Contact: {club.email}</span>
                        </div>
                        {club.status === "suspended" && club.suspensionReason && (
                          <div className="mt-2 text-xs text-[var(--destructive)]">
                            Suspension reason: {club.suspensionReason}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleChangeStatus(club)}>
                        Change Status
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>
      </PageContainer>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Club Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Club</Label>
              <div className="font-semibold">{selectedClub?.clubName}</div>
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
              {newStatus && <p className="text-xs text-[var(--muted-foreground)] mt-2">{transitionGuidance[newStatus]}</p>}
            </div>

            <div className="rounded-lg border border-[var(--border)] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <History className="h-4 w-4 text-[var(--primary)]" />
                Status History
              </div>
              <div className="space-y-3">
                {buildStatusTimeline(selectedClub).map((item, index) => (
                  <div key={`${item.label}-${index}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          item.tone === "destructive" ? "bg-[var(--destructive)]" : "bg-[var(--success)]"
                        }`}
                      />
                      {index < buildStatusTimeline(selectedClub).length - 1 && (
                        <div className="mt-1 h-full min-h-8 w-px bg-[var(--border)]" />
                      )}
                    </div>
                    <div className="min-w-0 pb-1">
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{item.detail}</div>
                      {item.date && (
                        <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                          {new Date(item.date).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                className={statusReasonError ? "border-[var(--destructive)] focus-visible:ring-[var(--destructive)]" : ""}
              />
              {statusReasonError && <p className="mt-2 text-xs text-[var(--destructive)]">{statusReasonError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStatusChange} disabled={isSaving}>
              {isSaving ? "Saving..." : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
