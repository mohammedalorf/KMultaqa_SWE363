import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FileText, Gavel, Search } from "lucide-react";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { Toolbar } from "../../components/layout/Toolbar";
import { DataTable, DataTableBody, DataTableHead, DataTd, DataTh, DataTr } from "../../components/layout/DataTable";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { mockAppeals } from "../../data/mockData";

function getStatusVariant(status) {
  if (["overturned", "accepted"].includes(status)) return "success";
  if (["upheld", "denied"].includes(status)) return "destructive";
  if (status === "modified") return "info";
  return "warning";
}

function normalizeAppeal(appeal) {
  return {
    ...appeal,
    status:
      appeal.status === "accepted"
        ? "overturned"
        : appeal.status === "denied"
          ? "upheld"
          : appeal.status,
    explanation: appeal.explanation || "",
  };
}

export default function Appeals() {
  const [appeals, setAppeals] = useState(() => mockAppeals.map(normalizeAppeal));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [decision, setDecision] = useState("upheld");
  const [explanation, setExplanation] = useState("");

  const filteredAppeals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return appeals;

    return appeals.filter((appeal) => {
      return [appeal.submittedBy, appeal.type, appeal.originalDecision, appeal.evidence]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [appeals, searchQuery]);

  const openAppeal = (appeal) => {
    setSelectedAppeal(appeal);
    setDecision(appeal.status === "pending" ? "upheld" : appeal.status);
    setExplanation(appeal.explanation || "");
  };

  const closeAppeal = () => {
    setSelectedAppeal(null);
    setDecision("upheld");
    setExplanation("");
  };

  const handleDecision = () => {
    if (!selectedAppeal) return;

    if (!explanation.trim()) {
      toast.error("Decision explanation is required.");
      return;
    }

    setAppeals((current) =>
      current.map((appeal) =>
        appeal.id === selectedAppeal.id
          ? {
              ...appeal,
              status: decision,
              explanation: explanation.trim(),
            }
          : appeal
      )
    );
    toast.success(`Appeal ${decision}. Backend persistence still needs the appeals API.`);
    closeAppeal();
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Moderation"
        title="Appeals Queue"
        subtitle="Review re-evaluation requests for rejected clubs and moderation decisions."
      />

      <Toolbar>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Search appeals..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-xs text-[var(--muted-foreground)]">
          {filteredAppeals.length} appeals
        </div>
      </Toolbar>

      <Section title="Appeals">
        <DataTable>
          <DataTableHead>
            <DataTh>Requester</DataTh>
            <DataTh>Type</DataTh>
            <DataTh>Status</DataTh>
            <DataTh>Submitted</DataTh>
            <DataTh align="right">Actions</DataTh>
          </DataTableHead>
          <DataTableBody>
            {filteredAppeals.length === 0 ? (
              <DataTr>
                <DataTd colSpan={5}>
                  <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                    No appeals found.
                  </div>
                </DataTd>
              </DataTr>
            ) : (
              filteredAppeals.map((appeal) => (
                <DataTr key={appeal.id}>
                  <DataTd className="font-medium">{appeal.submittedBy}</DataTd>
                  <DataTd className="capitalize text-[var(--muted-foreground)]">
                    {appeal.type.replace(/-/g, " ")}
                  </DataTd>
                  <DataTd>
                    <Badge variant={getStatusVariant(appeal.status)}>{appeal.status}</Badge>
                  </DataTd>
                  <DataTd className="text-[var(--muted-foreground)]">
                    {new Date(appeal.submittedAt).toLocaleDateString()}
                  </DataTd>
                  <DataTd align="right">
                    <Button variant="ghost" size="sm" onClick={() => openAppeal(appeal)}>
                      <FileText className="h-4 w-4" />
                      Review
                    </Button>
                  </DataTd>
                </DataTr>
              ))
            )}
          </DataTableBody>
        </DataTable>
      </Section>

      <Dialog open={Boolean(selectedAppeal)} onOpenChange={(open) => !open && closeAppeal()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Appeal</DialogTitle>
          </DialogHeader>
          {selectedAppeal && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Requester</Label>
                  <div className="font-medium">{selectedAppeal.submittedBy}</div>
                </div>
                <div>
                  <Label>Appeal Type</Label>
                  <div className="capitalize">{selectedAppeal.type.replace(/-/g, " ")}</div>
                </div>
              </div>

              <div>
                <Label>Original Decision</Label>
                <div className="rounded-lg bg-[var(--accent)] p-3 text-sm">
                  {selectedAppeal.originalDecision}
                </div>
              </div>

              <div>
                <Label>New Evidence</Label>
                <div className="rounded-lg bg-[var(--accent)] p-3 text-sm">
                  {selectedAppeal.evidence}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Decision</Label>
                  <Select value={decision} onValueChange={setDecision}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upheld">Uphold original decision</SelectItem>
                      <SelectItem value="overturned">Overturn decision</SelectItem>
                      <SelectItem value="modified">Modify decision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg border border-[var(--border)] p-3 text-xs text-[var(--muted-foreground)]">
                  <div className="mb-1 flex items-center gap-2 font-medium text-[var(--foreground)]">
                    <Gavel className="h-4 w-4" />
                    Required validation
                  </div>
                  Confirm the appeal references a valid original action and is within the allowed window before saving.
                </div>
              </div>

              <div>
                <Label htmlFor="appealExplanation">Decision Explanation</Label>
                <Textarea
                  id="appealExplanation"
                  value={explanation}
                  onChange={(event) => setExplanation(event.target.value)}
                  placeholder="Explain the appeal decision..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeAppeal}>Cancel</Button>
            <Button onClick={handleDecision}>Save Decision</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
