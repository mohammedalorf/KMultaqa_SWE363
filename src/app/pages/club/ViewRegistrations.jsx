import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Calendar, CheckCircle2, Download, Eye, Search, Users, XCircle } from "lucide-react";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { StatGrid, Stat } from "../../components/layout/StatGrid";
import { Toolbar } from "../../components/layout/Toolbar";
import { EmptyState } from "../../components/layout/EmptyState";
import { DataTable, DataTableHead, DataTableBody, DataTh, DataTr, DataTd } from "../../components/layout/DataTable";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { getApiErrorMessage } from "../../api/apiClient";
import { getClubEventRegistrations, updateClubEventRegistrationStatus } from "../../api/clubApi";

function formatDate(value) {
  if (!value) return "Date TBA";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "Unknown";

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export default function ViewRegistrations() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [busyRegistrationId, setBusyRegistrationId] = useState("");

  const loadRegistrations = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const { data } = await getClubEventRegistrations(id);
      setEvent(data.event ?? null);
      setRegistrations(data.registrations ?? []);
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not load registrations.");
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [id]);

  const filteredRegistrations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return registrations;
    }

    return registrations.filter(
      (registration) =>
        registration.studentName.toLowerCase().includes(query) ||
        registration.studentId.toLowerCase().includes(query) ||
        registration.email.toLowerCase().includes(query)
    );
  }, [registrations, searchQuery]);

  const handleExport = () => {
    const rows = [
      ["Student Name", "Student ID", "Email", "Status", "Registered At", "Answers"],
      ...registrations.map((registration) => [
        registration.studentName,
        registration.studentId,
        registration.email,
        registration.status,
        formatDateTime(registration.registeredAt),
        (registration.answers ?? [])
          .map((answer) => `${answer.fieldLabel}: ${answer.answer}`)
          .join("; "),
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${event?.title || "event"}-registrations.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Registration data exported.");
  };

  const getStatusBadge = (status) => {
    if (status === "pending") return <Badge variant="outline">Pending</Badge>;
    if (status === "registered") return <Badge variant="success">Approved</Badge>;
    if (status === "declined") return <Badge variant="destructive">Declined</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  const handleDecision = async (registration, status) => {
    setBusyRegistrationId(registration.id);

    try {
      const { data } = await updateClubEventRegistrationStatus(id, registration.id, status);
      setRegistrations((current) =>
        current.map((item) => (item.id === registration.id ? data.registration : item))
      );
      setSelectedRegistration((current) =>
        current?.id === registration.id ? data.registration : current
      );
      toast.success(data.message || "Registration updated.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update registration."));
    } finally {
      setBusyRegistrationId("");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Events"
        title={event?.title || "Registrations"}
        subtitle="View event registrations from the database."
        breadcrumbs={[
          { label: "My Events", to: "/club/events" },
          { label: "Registrations" },
        ]}
        actions={
          <Button variant="outline" onClick={handleExport} disabled={registrations.length === 0 || isLoading}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        }
      />

      <StatGrid cols={2}>
        <Stat
          label="Total Registrations"
          value={registrations.length}
          icon={<Users className="w-5 h-5" />}
          tone="primary"
        />
        <Stat
          label="Event Date"
          value={formatDate(event?.startDateTime)}
          icon={<Calendar className="w-5 h-5" />}
          tone="teal"
        />
      </StatGrid>

      <Section title="Registrants" description={`Showing ${filteredRegistrations.length} of ${registrations.length}`}>
        <Toolbar>
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search by name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </Toolbar>

        {isLoading ? (
          <Card className="p-8 text-center text-sm text-[var(--muted-foreground)]">
            Loading registrations...
          </Card>
        ) : loadError ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="Could not load registrations"
            description={loadError}
            action={<Button onClick={loadRegistrations}>Try Again</Button>}
          />
        ) : filteredRegistrations.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No registrations found"
            description={searchQuery ? "Try adjusting your search criteria." : "No students have registered yet."}
          />
        ) : (
          <DataTable>
            <DataTableHead>
              <DataTh>Student</DataTh>
              <DataTh>Student ID</DataTh>
              <DataTh>Email</DataTh>
              <DataTh>Status</DataTh>
              <DataTh>Registered At</DataTh>
              <DataTh align="right">Actions</DataTh>
            </DataTableHead>
            <DataTableBody>
              {filteredRegistrations.map((registration) => (
                <DataTr key={registration.id}>
                  <DataTd className="font-medium">{registration.studentName}</DataTd>
                  <DataTd className="text-[var(--muted-foreground)]">{registration.studentId}</DataTd>
                  <DataTd className="text-[var(--muted-foreground)]">{registration.email}</DataTd>
                  <DataTd>{getStatusBadge(registration.status)}</DataTd>
                  <DataTd className="text-[var(--muted-foreground)]">
                    {formatDateTime(registration.registeredAt)}
                  </DataTd>
                  <DataTd align="right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRegistration(registration)}
                    >
                      <Eye className="w-4 h-4" />
                      View Answers
                    </Button>
                  </DataTd>
                </DataTr>
              ))}
            </DataTableBody>
          </DataTable>
        )}
      </Section>

      <Dialog open={Boolean(selectedRegistration)} onOpenChange={(open) => !open && setSelectedRegistration(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registration Answers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--accent)]/40 p-4">
              <div className="font-medium">{selectedRegistration?.studentName}</div>
              <div className="text-sm text-[var(--muted-foreground)]">
                {selectedRegistration?.studentId} &middot; {selectedRegistration?.email}
              </div>
              <div className="mt-2">{selectedRegistration && getStatusBadge(selectedRegistration.status)}</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">
                Registered {formatDateTime(selectedRegistration?.registeredAt)}
              </div>
            </div>

            {(selectedRegistration?.answers ?? []).length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">No custom answers were submitted.</p>
            ) : (
              <div className="space-y-3">
                {selectedRegistration.answers.map((answer) => (
                  <div key={`${answer.fieldLabel}-${answer.answer}`} className="rounded-lg border border-[var(--border)] p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                      {answer.fieldLabel}
                    </div>
                    <div className="mt-1 text-sm text-[var(--foreground)]">{answer.answer}</div>
                  </div>
                ))}
              </div>
            )}

            {selectedRegistration?.status === "pending" && (
              <DialogFooter className="border-t border-[var(--border)] pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleDecision(selectedRegistration, "registered")}
                  disabled={busyRegistrationId === selectedRegistration.id}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDecision(selectedRegistration, "declined")}
                  disabled={busyRegistrationId === selectedRegistration.id}
                >
                  <XCircle className="w-4 h-4" />
                  Decline
                </Button>
              </DialogFooter>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
