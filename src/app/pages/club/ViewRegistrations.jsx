import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Calendar, Download, Search, Users } from "lucide-react";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { StatGrid, Stat } from "../../components/layout/StatGrid";
import { Toolbar } from "../../components/layout/Toolbar";
import { EmptyState } from "../../components/layout/EmptyState";
import { DataTable, DataTableHead, DataTableBody, DataTh, DataTr, DataTd } from "../../components/layout/DataTable";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { getApiErrorMessage } from "../../api/apiClient";
import { getClubEventRegistrations } from "../../api/clubApi";

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

  const hasAnswers = registrations.some((registration) => registration.answers?.length > 0);

  const handleExport = () => {
    const rows = [
      ["Student Name", "Student ID", "Email", "Registered At", "Answers"],
      ...registrations.map((registration) => [
        registration.studentName,
        registration.studentId,
        registration.email,
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
              <DataTh>Registered At</DataTh>
              {hasAnswers && <DataTh>Answers</DataTh>}
            </DataTableHead>
            <DataTableBody>
              {filteredRegistrations.map((registration) => (
                <DataTr key={registration.id}>
                  <DataTd className="font-medium">{registration.studentName}</DataTd>
                  <DataTd className="text-[var(--muted-foreground)]">{registration.studentId}</DataTd>
                  <DataTd className="text-[var(--muted-foreground)]">{registration.email}</DataTd>
                  <DataTd className="text-[var(--muted-foreground)]">
                    {formatDateTime(registration.registeredAt)}
                  </DataTd>
                  {hasAnswers && (
                    <DataTd className="text-[var(--muted-foreground)]">
                      {(registration.answers ?? []).length > 0
                        ? registration.answers
                            .map((answer) => `${answer.fieldLabel}: ${answer.answer}`)
                            .join("; ")
                        : "No custom answers"}
                    </DataTd>
                  )}
                </DataTr>
              ))}
            </DataTableBody>
          </DataTable>
        )}
      </Section>
    </PageContainer>
  );
}
