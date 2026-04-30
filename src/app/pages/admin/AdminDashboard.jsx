import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { StatGrid, Stat } from "../../components/layout/StatGrid";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { CheckSquare, Flag, Users, Calendar } from "lucide-react";
import { getApiErrorMessage } from "../../api/apiClient";
import { getAdminDashboard } from "../../api/adminApi";

const emptyDashboard = {
  stats: {
    totalClubs: 0,
    pendingApprovals: 0,
    activeEvents: 0,
    openReports: 0,
  },
  recentRequests: [],
  recentReports: [],
  activeClubs: [],
};

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);

      try {
        const { data } = await getAdminDashboard();

        if (!cancelled) {
          setDashboard({
            ...emptyDashboard,
            ...data,
            stats: {
              ...emptyDashboard.stats,
              ...(data.stats || {}),
            },
          });
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error, "Could not load admin dashboard."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        subtitle="Welcome back — here's what's happening on the platform."
      />

      <StatGrid cols={4}>
        <Stat label="Total Clubs" value={dashboard.stats.totalClubs} icon={<Users className="w-5 h-5" />} tone="primary" />
        <Stat label="Pending Approvals" value={dashboard.stats.pendingApprovals} icon={<CheckSquare className="w-5 h-5" />} tone="warning" />
        <Stat label="Active Events" value={dashboard.stats.activeEvents} icon={<Calendar className="w-5 h-5" />} tone="info" />
        <Stat label="Open Reports" value={dashboard.stats.openReports} icon={<Flag className="w-5 h-5" />} tone="destructive" />
      </StatGrid>

      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Recent Club Approvals" description="Latest submissions awaiting review">
          <Card className="p-5">
            {isLoading ? (
              <p className="text-sm text-[var(--muted-foreground)]">Loading requests...</p>
            ) : dashboard.recentRequests.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">No pending approval requests.</p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {dashboard.recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{request.clubName}</div>
                      <div className="text-sm text-[var(--muted-foreground)] capitalize">{request.category}</div>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Section>

        <Section title="Recent Reports" description="Latest moderation items">
          <Card className="p-5">
            {isLoading ? (
              <p className="text-sm text-[var(--muted-foreground)]">Loading reports...</p>
            ) : dashboard.recentReports.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">No pending reports.</p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {dashboard.recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{report.targetName}</div>
                      <div className="text-sm text-[var(--muted-foreground)] truncate">{report.reason}</div>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Section>
      </div>

      <Section title="Active Clubs Summary" description="Recently approved active clubs">
        <Card className="p-5">
          {isLoading ? (
            <p className="text-sm text-[var(--muted-foreground)]">Loading clubs...</p>
          ) : dashboard.activeClubs.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No active clubs yet.</p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {dashboard.activeClubs.map((club) => (
                <div key={club.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-[var(--accent)] rounded-full flex items-center justify-center overflow-hidden font-semibold text-[var(--primary)] shrink-0">
                      {club.logoUrl ? (
                        <img src={club.logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        club.clubName?.charAt(0) || "C"
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{club.clubName}</div>
                      <div className="text-sm text-[var(--muted-foreground)] capitalize truncate">{club.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:block text-sm text-[var(--muted-foreground)]">
                      {club.followers} followers
                    </div>
                    <Badge variant="success">active</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Section>
    </PageContainer>
  );
}
