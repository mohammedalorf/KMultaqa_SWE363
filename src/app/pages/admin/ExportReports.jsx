import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Download, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const SIZE_LIMIT = 5000;
const BASE_MULTIPLIER = {
  clubs: 12,
  events: 18,
  reports: 25,
  registrations: 35
};

function getDaysBetween(dateFrom, dateTo) {
  if (!dateFrom || !dateTo) return 30;
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  return Math.floor((to - from) / (24 * 60 * 60 * 1000)) + 1;
}

export default function ExportReports() {
  const [reportType, setReportType] = useState("clubs");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [format, setFormat] = useState("csv");

  const estimatedRows = useMemo(() => {
    const days = getDaysBetween(dateFrom, dateTo);
    return Math.max(1, days) * (BASE_MULTIPLIER[reportType] || 15);
  }, [dateFrom, dateTo, reportType]);

  const handleExport = () => {
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      toast.error("Invalid date range: Date From must be before or equal to Date To.");
      return;
    }

    if (estimatedRows > SIZE_LIMIT) {
      toast.error(`Export too large (~${estimatedRows} rows). Narrow filters/date range and try again.`);
      return;
    }

    toast.success(`${reportType} report exported as ${format.toUpperCase()} (${estimatedRows} rows)`);
  };

  const tooLarge = estimatedRows > SIZE_LIMIT;

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
                    <SelectItem value="registrations">Event Registrations</SelectItem>
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

              <div className="space-y-1.5">
                <Label htmlFor="format">Export Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                    <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={`rounded-lg border p-4 flex gap-3 ${tooLarge ? "bg-[var(--destructive-soft)] border-[var(--destructive)]/20" : "bg-[var(--primary-soft)] border-[var(--primary)]/15"}`}>
                <Info className={`w-4 h-4 mt-0.5 shrink-0 ${tooLarge ? "text-[var(--destructive)]" : "text-[var(--primary)]"}`} />
                <div className="min-w-0">
                  <div className="text-sm font-medium">Estimated export size: ~{estimatedRows} rows</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    Exports above {SIZE_LIMIT} rows are blocked. Narrow date range or filters.
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-[var(--border)]">
                <Button onClick={handleExport} size="lg">
                  <Download className="w-4 h-4" />
                  Generate & Export Report
                </Button>
              </div>
            </div>
          </Card>
        </Section>
    </PageContainer>
  );
}
