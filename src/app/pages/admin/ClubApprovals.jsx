import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { StatGrid, Stat } from "../../components/layout/StatGrid";
import { DataTable, DataTableHead, DataTableBody, DataTh, DataTr, DataTd } from "../../components/layout/DataTable";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Check, X, Eye, Clock, Mail } from "lucide-react";
import { getApiErrorMessage } from "../../api/apiClient";
import { getClubRequests, reviewClubRequest } from "../../api/adminApi";

function statusVariant(status) {
  if (status === "approved") return "success";
  if (status === "rejected") return "destructive";
  return "warning";
}

export default function ClubApprovals() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState("approved");
  const [decisionNote, setDecisionNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRequests() {
      setIsLoading(true);

      try {
        const { data } = await getClubRequests();

        if (!cancelled) {
          setRequests(data.requests || []);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error, "Could not load club requests."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };

  const openActionConfirm = (action) => {
    setPendingAction(action);
    setDecisionNote("");
    setShowConfirmDialog(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedRequest) return;

    if (pendingAction === "rejected" && !decisionNote.trim()) {
      toast.error("Rejection note is required.");
      return;
    }

    setIsReviewing(true);

    try {
      const { data } = await reviewClubRequest(selectedRequest.id, {
        status: pendingAction,
        adminNote: decisionNote.trim(),
      });

      setRequests((prev) =>
        prev.map((request) => (request.id === selectedRequest.id ? data.request : request))
      );

      toast.success(
        pendingAction === "approved"
          ? data.emailDelivery?.sent === false
            ? `${selectedRequest.clubName} was approved, but the setup email was not sent by SMTP.`
            : `${selectedRequest.clubName} was approved and sent a password setup email.`
          : data.emailDelivery?.sent === false
            ? `${selectedRequest.clubName} was rejected, but the rejection email was not sent by SMTP.`
            : `${selectedRequest.clubName} was rejected and sent a rejection email.`
      );

      setSelectedRequest(data.request);
      setShowConfirmDialog(false);
      setShowDetailsDialog(false);
      setDecisionNote("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not review club request."));
    } finally {
      setIsReviewing(false);
    }
  };

  const pendingCount = requests.filter((request) => request.status === "pending").length;
  const approvedCount = requests.filter((request) => request.status === "approved").length;
  const rejectedCount = requests.filter((request) => request.status === "rejected").length;

  return (
    <>
      <PageContainer>
        <PageHeader
          eyebrow="Moderation"
          title="Club Approval Requests"
          subtitle="Review and approve or reject club registration requests."
        />

        <StatGrid cols={3}>
          <Stat label="Pending" value={pendingCount} icon={<Clock className="w-5 h-5" />} tone="warning" />
          <Stat label="Approved" value={approvedCount} icon={<Check className="w-5 h-5" />} tone="success" />
          <Stat label="Rejected" value={rejectedCount} icon={<X className="w-5 h-5" />} tone="destructive" />
        </StatGrid>

        <Section title="All Requests" description="Newest submissions first.">
          {isLoading ? (
            <DataTable>
              <DataTableBody>
                <DataTr>
                  <DataTd>
                    <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                      Loading approval requests...
                    </div>
                  </DataTd>
                </DataTr>
              </DataTableBody>
            </DataTable>
          ) : requests.length === 0 ? (
            <DataTable>
              <DataTableBody>
                <DataTr>
                  <DataTd>
                    <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                      No approval requests
                    </div>
                  </DataTd>
                </DataTr>
              </DataTableBody>
            </DataTable>
          ) : (
            <DataTable>
              <DataTableHead>
                <DataTh>Club Name</DataTh>
                <DataTh>Category</DataTh>
                <DataTh>Representative</DataTh>
                <DataTh>Club Email</DataTh>
                <DataTh>Submitted</DataTh>
                <DataTh>Status</DataTh>
                <DataTh align="right">Actions</DataTh>
              </DataTableHead>
              <DataTableBody>
                {requests.map((request) => (
                  <DataTr key={request.id}>
                    <DataTd className="font-medium">{request.clubName}</DataTd>
                    <DataTd className="text-[var(--muted-foreground)] capitalize">{request.category}</DataTd>
                    <DataTd className="text-[var(--muted-foreground)]">{request.representativeName}</DataTd>
                    <DataTd className="text-[var(--muted-foreground)]">{request.requestedEmail}</DataTd>
                    <DataTd className="text-[var(--muted-foreground)]">{new Date(request.submittedAt).toLocaleDateString()}</DataTd>
                    <DataTd>
                      <Badge variant={statusVariant(request.status)}>{request.status}</Badge>
                    </DataTd>
                    <DataTd align="right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(request)}>
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </DataTd>
                  </DataTr>
                ))}
              </DataTableBody>
            </DataTable>
          )}
        </Section>
      </PageContainer>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Club Approval Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label>Club Name</Label>
                <div className="text-lg font-semibold">{selectedRequest.clubName}</div>
              </div>
              <div>
                <Label>Description</Label>
                <div className="text-sm text-[var(--muted-foreground)] leading-relaxed">{selectedRequest.description}</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <div className="capitalize">{selectedRequest.category}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div><Badge variant={statusVariant(selectedRequest.status)}>{selectedRequest.status}</Badge></div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Representative</Label>
                  <div>{selectedRequest.representativeName}</div>
                  <div className="text-sm text-[var(--muted-foreground)]">{selectedRequest.representativeStudentId}</div>
                </div>
                <div>
                  <Label>Representative Email</Label>
                  <div className="text-sm">{selectedRequest.representativeEmail}</div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--accent)]/60 flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[var(--primary)]" />
                <span>Approved setup email will be sent to {selectedRequest.requestedEmail}</span>
              </div>
              {selectedRequest.adminNote && (
                <div>
                  <Label>Admin Note</Label>
                  <div className="text-sm text-[var(--muted-foreground)]">{selectedRequest.adminNote}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedRequest?.status === "pending" && (
              <>
                <Button variant="outline" onClick={() => openActionConfirm("rejected")}>
                  <X className="w-4 h-4" />
                  Reject
                </Button>
                <Button onClick={() => openActionConfirm("approved")}>
                  <Check className="w-4 h-4" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pendingAction === "approved" ? "Confirm Approval" : "Confirm Rejection"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              {pendingAction === "approved"
                ? "Approving creates the club account and sends a password setup email."
                : "Rejecting keeps the request record and emails the representative and requested club email."}
            </p>
            <div>
              <Label htmlFor="decisionNote">
                {pendingAction === "approved" ? "Note (optional)" : "Rejection Note (required)"}
              </Label>
              <Textarea
                id="decisionNote"
                placeholder="Add context for this decision..."
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={pendingAction === "rejected" ? "destructive" : "default"}
              onClick={handleActionConfirm}
              disabled={isReviewing || (pendingAction === "rejected" && !decisionNote.trim())}
            >
              {isReviewing ? "Reviewing..." : `Confirm ${pendingAction === "approved" ? "Approval" : "Rejection"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
