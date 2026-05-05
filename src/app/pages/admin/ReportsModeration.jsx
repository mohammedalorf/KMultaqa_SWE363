import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { StatGrid, Stat } from "../../components/layout/StatGrid";
import { Toolbar } from "../../components/layout/Toolbar";
import { DataTable, DataTableHead, DataTableBody, DataTh, DataTr, DataTd } from "../../components/layout/DataTable";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Eye, Flag, Check, X } from "lucide-react";
import { getApiErrorMessage } from "../../api/apiClient";
import { getAdminReports, updateAdminReport } from "../../api/adminApi";

function reportStatusVariant(status) {
  if (status === "resolved") return "success";
  if (status === "dismissed") return "secondary";
  return "warning";
}

const moderationActions = {
  dismiss: "Dismiss",
  remove: "Remove content",
  suspend: "Suspend club",
};

function getDefaultModerationAction(report) {
  if (["Post", "Event"].includes(report?.targetModel)) return "remove";
  if (report?.targetModel === "Club") return "suspend";
  return "dismiss";
}

function getAvailableModerationActions(report) {
  const actions = ["dismiss"];

  if (["Post", "Event"].includes(report?.targetModel)) {
    actions.push("remove");
  }

  if (report?.targetModel === "Club") {
    actions.push("suspend");
  }

  return actions;
}

export default function ReportsModeration() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState("dismiss");
  const [adminNote, setAdminNote] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      setIsLoading(true);

      try {
        const { data } = await getAdminReports({ status: filterStatus });

        if (!cancelled) {
          setReports(data.reports || []);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error, "Could not load reports."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      cancelled = true;
    };
  }, [filterStatus]);

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setModerationAction(getDefaultModerationAction(report));
    setAdminNote(report.adminNote || "");
    setShowDetailsDialog(true);
  };

  const canApplyAction = selectedReport?.status === "pending";
  const availableModerationActions = getAvailableModerationActions(selectedReport);
  const needsRemovalReason = moderationAction === "remove";
  const needsSuspensionReason = moderationAction === "suspend";

  const validateModerationAction = () => {
    if (!availableModerationActions.includes(moderationAction)) {
      return "Choose an available moderation action for this report.";
    }

    if (needsRemovalReason && !adminNote.trim()) {
      return "Removal reason is required.";
    }

    if (needsSuspensionReason && !adminNote.trim()) {
      return "Suspension reason is required.";
    }

    return "";
  };

  const handleAction = async () => {
    if (!selectedReport || !canApplyAction) {
      toast.error("Only pending reports can be moderated.");
      return;
    }

    const validationError = validateModerationAction();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const status = moderationAction === "dismiss" ? "dismissed" : "resolved";

    setIsSaving(true);

    try {
      const { data } = await updateAdminReport(selectedReport.id, {
        status,
        moderationAction,
        adminNote: adminNote.trim(),
      });

      setReports((prev) => prev.map((report) => (report.id === selectedReport.id ? data.report : report)));
      toast.success(
        moderationAction === "dismiss"
          ? "Report dismissed."
          : moderationAction === "suspend"
            ? data.notificationDelivery?.delivery === "failed"
              ? "Club suspended. Email notification could not be sent."
              : "Club suspended and notified."
            : data.notificationDelivery?.delivery === "failed"
              ? "Content removed. Email notification could not be sent."
              : "Content removed and club notified."
      );
      setShowDetailsDialog(false);
      setSelectedReport(null);
      setModerationAction("dismiss");
      setAdminNote("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update report."));
    } finally {
      setIsSaving(false);
    }
  };

  const pendingCount = reports.filter((report) => report.status === "pending").length;
  const resolvedCount = reports.filter((report) => report.status === "resolved").length;
  const dismissedCount = reports.filter((report) => report.status === "dismissed").length;

  return (
    <>
      <PageContainer>
        <PageHeader
          eyebrow="Moderation"
          title="Reports & Moderation"
          subtitle="Review and moderate reported content."
        />

        <StatGrid cols={3}>
          <Stat label="Pending Reports" value={pendingCount} icon={<Flag className="w-5 h-5" />} tone="destructive" />
          <Stat label="Resolved" value={resolvedCount} icon={<Check className="w-5 h-5" />} tone="success" />
          <Stat label="Dismissed" value={dismissedCount} icon={<X className="w-5 h-5" />} tone="info" />
        </StatGrid>

        <Toolbar>
          <div className="flex items-center gap-3">
            <Label className="text-xs text-[var(--muted-foreground)] mb-0">Filter by status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            {isLoading ? "Loading..." : `Showing ${reports.length} reports`}
          </div>
        </Toolbar>

        <Section title="Reports Queue">
          <DataTable>
            <DataTableHead>
              <DataTh>Type</DataTh>
              <DataTh>Target</DataTh>
              <DataTh>Reason</DataTh>
              <DataTh>Reporter</DataTh>
              <DataTh>Status</DataTh>
              <DataTh>Date</DataTh>
              <DataTh align="right">Actions</DataTh>
            </DataTableHead>
            <DataTableBody>
              {isLoading ? (
                <DataTr>
                  <DataTd colSpan={7}>
                    <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                      Loading reports...
                    </div>
                  </DataTd>
                </DataTr>
              ) : reports.length === 0 ? (
                <DataTr>
                  <DataTd colSpan={7}>
                    <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                      No reports found.
                    </div>
                  </DataTd>
                </DataTr>
              ) : (
                reports.map((report) => (
                  <DataTr key={report.id}>
                    <DataTd>
                      <Badge variant="outline">{report.targetModel}</Badge>
                    </DataTd>
                    <DataTd className="font-medium">{report.targetName}</DataTd>
                    <DataTd className="text-[var(--muted-foreground)]">{report.reason}</DataTd>
                    <DataTd className="text-[var(--muted-foreground)]">{report.reporterName}</DataTd>
                    <DataTd>
                      <Badge variant={reportStatusVariant(report.status)}>{report.status}</Badge>
                    </DataTd>
                    <DataTd className="text-[var(--muted-foreground)]">{new Date(report.createdAt).toLocaleDateString()}</DataTd>
                    <DataTd align="right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewReport(report)}>
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </DataTd>
                  </DataTr>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </Section>
      </PageContainer>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Report Type</Label>
                  <div className="font-medium">{selectedReport.targetModel}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>
                    <Badge variant={reportStatusVariant(selectedReport.status)}>{selectedReport.status}</Badge>
                  </div>
                  {!canApplyAction && (
                    <p className="text-xs text-[var(--destructive)] mt-1">
                      Only pending reports can be moderated.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label>Target</Label>
                <div className="font-medium">{selectedReport.targetName}</div>
              </div>
              <div>
                <Label>Reported By</Label>
                <div>{selectedReport.reporterName}</div>
                {selectedReport.reporterEmail && (
                  <div className="text-sm text-[var(--muted-foreground)]">{selectedReport.reporterEmail}</div>
                )}
              </div>
              <div>
                <Label>Reason</Label>
                <div>{selectedReport.reason}</div>
              </div>
              <div>
                <Label>Description</Label>
                <div className="p-3 bg-[var(--accent)] rounded-lg text-sm">
                  {selectedReport.description || "No description provided."}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Moderation Action</Label>
                  <Select value={moderationAction} onValueChange={setModerationAction} disabled={!canApplyAction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModerationActions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {moderationActions[action]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="adminNote">
                  {needsRemovalReason
                    ? "Removal Reason"
                    : needsSuspensionReason
                      ? "Suspension Reason"
                      : "Admin Note"}
                </Label>
                <Textarea
                  id="adminNote"
                  placeholder={
                    needsRemovalReason
                      ? "Explain why this content is being removed..."
                      : needsSuspensionReason
                        ? "Explain why this club is being suspended..."
                        : "Add notes about your decision..."
                  }
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  disabled={!canApplyAction}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button onClick={handleAction} className="w-full sm:w-auto" disabled={!canApplyAction || isSaving}>
              {isSaving
                ? "Saving..."
                : moderationAction === "dismiss"
                  ? "Dismiss Report"
                  : moderationAction === "suspend"
                    ? "Suspend Club"
                    : "Remove Content"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
