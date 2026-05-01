import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Download, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { exportAdminDataset } from "../../api/adminApi";
import { getApiErrorMessage } from "../../api/apiClient";

const SIZE_LIMIT = 5000;
const REPORT_TYPES = {
  clubs: "Clubs List",
  events: "Events List",
  reports: "Moderation Reports",
};

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getFilenameFromDisposition(disposition, fallback) {
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1] || fallback;
}

async function getExportErrorMessage(error) {
  const data = error?.response?.data;

  if (data instanceof Blob && data.type.includes("application/json")) {
    try {
      const payload = JSON.parse(await data.text());
      return payload.message || "Could not export report.";
    } catch {
      return "Could not export report.";
    }
  }

  return getApiErrorMessage(error, "Could not export report.");
}

export default function ExportReports() {
  const [reportType, setReportType] = useState("clubs");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      toast.error("Invalid date range: Date From must be before or equal to Date To.");
      return;
    }

    setIsExporting(true);

    try {
      const response = await exportAdminDataset(reportType, {
        dateFrom,
        dateTo,
        format: "csv",
      });
      const filename = getFilenameFromDisposition(
        response.headers["content-disposition"],
        `kmultaqa-${reportType}-${new Date().toISOString().slice(0, 10)}.csv`
      );

      downloadBlob(filename, response.data);
      toast.success(`${REPORT_TYPES[reportType]} CSV downloaded.`);
    } catch (error) {
      toast.error(await getExportErrorMessage(error));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageContainer size="narrow">
        <PageHeader
          eyebrow="Reports"
          title="Export Reports"
          subtitle="Generate and export reports for clubs, events, and moderation activities."
        />

        <Section title="Configure Export" description="Choose a dataset, timeframe, and format.">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clubs">Clubs List</SelectItem>
                    <SelectItem value="events">Events List</SelectItem>
                    <SelectItem value="reports">Moderation Reports</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dateFrom">Date From</Label>
                  <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dateTo">Date To</Label>
                  <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
              </div>

              {dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo) && (
                <p className="text-sm text-[var(--destructive)]">Date range is invalid: Date From must be before Date To.</p>
              )}

              <div className="rounded-lg border border-[var(--primary)]/15 bg-[var(--primary-soft)] p-4 flex gap-3">
                <Info className="w-4 h-4 mt-0.5 shrink-0 text-[var(--primary)]" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">CSV export uses live backend data.</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    Backend blocks exports above {SIZE_LIMIT} rows. Narrow the date range if the export is too large.
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-[var(--border)]">
                <Button onClick={handleExport} size="lg" disabled={isExporting}>
                  <Download className="w-4 h-4" />
                  {isExporting ? "Exporting..." : "Generate & Export Report"}
                </Button>
              </div>
            </div>
          </Card>
        </Section>
    </PageContainer>
  );
}
