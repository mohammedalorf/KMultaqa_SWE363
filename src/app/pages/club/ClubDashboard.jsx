import { useEffect, useState } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { StatGrid, Stat } from "../../components/layout/StatGrid";
import { EmptyState } from "../../components/layout/EmptyState";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowUpRight, Calendar, Clock, FileText, MapPin, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../api/apiClient";
import { getClubDashboard } from "../../api/clubApi";

const emptyDashboard = {
  stats: {
    followers: 0,
    totalPosts: 0,
    upcomingEvents: 0,
  },
  recentPosts: [],
  upcomingEvents: [],
};

function formatDate(value) {
  if (!value) return "Date TBA";

  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "Time TBA";

  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ClubDashboard() {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadDashboard = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const { data } = await getClubDashboard();

      setDashboard({
        stats: {
          followers: data.stats?.followers ?? 0,
          totalPosts: data.stats?.totalPosts ?? 0,
          upcomingEvents: data.stats?.upcomingEvents ?? 0,
        },
        recentPosts: data.recentPosts ?? [],
        upcomingEvents: data.upcomingEvents ?? [],
      });
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not load club dashboard.");
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = dashboard.stats;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        subtitle="Welcome back, here's your club overview."
        actions={
          <>
            <Link to="/club/posts/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </Link>
            <Link to="/club/events/new">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </Link>
          </>
        }
      />

      {isLoading ? (
        <Card className="p-8 text-center text-sm text-[var(--muted-foreground)]">
          Loading club dashboard...
        </Card>
      ) : loadError ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="Could not load dashboard"
          description={loadError}
          action={<Button onClick={loadDashboard}>Try Again</Button>}
        />
      ) : (
        <>
          <StatGrid cols={3}>
            <Stat
              label="Followers"
              value={stats.followers}
              icon={<Users className="w-5 h-5" />}
              tone="primary"
            />
            <Stat
              label="Total Posts"
              value={stats.totalPosts}
              icon={<FileText className="w-5 h-5" />}
              tone="info"
            />
            <Stat
              label="Upcoming Events"
              value={stats.upcomingEvents}
              icon={<Calendar className="w-5 h-5" />}
              tone="teal"
            />
          </StatGrid>

          <div className="grid lg:grid-cols-2 gap-6">
            <Section
              title="Recent Posts"
              description="Latest announcements and updates"
              actions={
                <Link to="/club/posts">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              }
            >
              <Card className="p-5">
                {dashboard.recentPosts.length === 0 ? (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    No posts published yet.
                  </p>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {dashboard.recentPosts.map((post) => (
                      <div key={post.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{post.title}</div>
                            <div className="text-sm text-[var(--muted-foreground)] mb-2 line-clamp-2">
                              {post.content}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                              <Clock className="w-3 h-3" />
                              <span>
                                {new Date(post.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                          {post.isPinned && <Badge variant="default">Pinned</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Section>

            <Section
              title="Upcoming Events"
              description="Your next scheduled events"
              actions={
                <Link to="/club/events">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              }
            >
              <Card className="p-5">
                {dashboard.upcomingEvents.length === 0 ? (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    No upcoming events scheduled.
                  </p>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {dashboard.upcomingEvents.map((event) => (
                      <div key={event.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium mb-2">{event.title}</div>
                            <div className="grid sm:grid-cols-2 gap-2 text-xs text-[var(--muted-foreground)]">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(event.startDateTime)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {formatTime(event.startDateTime)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {event.location || "Location TBA"}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                {event.capacity
                                  ? `${event.registered} / ${event.capacity} registered`
                                  : `${event.registered} registered`}
                              </span>
                            </div>
                          </div>
                          <Link to={`/club/registrations/${event.id}`}>
                            <Button variant="ghost" size="icon" aria-label="View registrations">
                              <ArrowUpRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Section>
          </div>
        </>
      )}
    </PageContainer>
  );
}
