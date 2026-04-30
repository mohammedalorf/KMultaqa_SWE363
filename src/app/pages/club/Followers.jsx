import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Calendar, Search, Users } from "lucide-react";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { StatGrid, Stat } from "../../components/layout/StatGrid";
import { Toolbar } from "../../components/layout/Toolbar";
import { EmptyState } from "../../components/layout/EmptyState";
import { DataTable, DataTableHead, DataTableBody, DataTh, DataTr, DataTd } from "../../components/layout/DataTable";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { getApiErrorMessage } from "../../api/apiClient";
import { getClubFollowers } from "../../api/clubApi";

export default function Followers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [followers, setFollowers] = useState([]);
  const [stats, setStats] = useState({ totalFollowers: 0, totalEventRegistrations: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadFollowers = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const { data } = await getClubFollowers();
      setFollowers(data.followers ?? []);
      setStats({
        totalFollowers: data.stats?.totalFollowers ?? 0,
        totalEventRegistrations: data.stats?.totalEventRegistrations ?? 0,
      });
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not load followers.");
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFollowers();
  }, []);

  const filteredFollowers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return followers;
    }

    return followers.filter(
      (follower) =>
        follower.name.toLowerCase().includes(query) ||
        follower.email.toLowerCase().includes(query) ||
        follower.studentId.toLowerCase().includes(query)
    );
  }, [followers, searchQuery]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Community"
        title="Followers"
        subtitle="View students who follow your club."
      />

      <StatGrid cols={2}>
        <Stat label="Total Followers" value={stats.totalFollowers} icon={<Users className="w-5 h-5" />} tone="primary" />
        <Stat label="Event Registrations" value={stats.totalEventRegistrations} icon={<Calendar className="w-5 h-5" />} tone="teal" />
      </StatGrid>

      <Section title="All Followers" description={`Showing ${filteredFollowers.length} of ${stats.totalFollowers}`}>
        <Toolbar>
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search followers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </Toolbar>

        {isLoading ? (
          <Card className="p-8 text-center text-sm text-[var(--muted-foreground)]">
            Loading followers...
          </Card>
        ) : loadError ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="Could not load followers"
            description={loadError}
            action={<Button onClick={loadFollowers}>Try Again</Button>}
          />
        ) : filteredFollowers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No followers found"
            description={searchQuery ? "Try adjusting your search terms." : "No students follow this club yet."}
          />
        ) : (
          <DataTable>
            <DataTableHead>
              <DataTh>Student</DataTh>
              <DataTh>Student ID</DataTh>
              <DataTh>Email</DataTh>
              <DataTh align="center">Registered Events</DataTh>
            </DataTableHead>
            <DataTableBody>
              {filteredFollowers.map((follower) => (
                <DataTr key={follower.id}>
                  <DataTd>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[var(--primary-soft)] text-[var(--primary)] rounded-full flex items-center justify-center font-semibold shrink-0">
                        {follower.name?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                      <span className="font-medium">{follower.name}</span>
                    </div>
                  </DataTd>
                  <DataTd className="text-[var(--muted-foreground)]">{follower.studentId}</DataTd>
                  <DataTd className="text-[var(--muted-foreground)]">{follower.email}</DataTd>
                  <DataTd align="center">
                    <Badge variant="secondary">{follower.registeredEvents}</Badge>
                  </DataTd>
                </DataTr>
              ))}
            </DataTableBody>
          </DataTable>
        )}
      </Section>
    </PageContainer>
  );
}
