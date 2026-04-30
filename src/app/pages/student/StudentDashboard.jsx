import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { EmptyState } from "../../components/layout/EmptyState";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Link } from "react-router-dom";
import { Rss, Search, Calendar, Clock, MapPin, Users, ArrowUpRight, Flag, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../api/apiClient";
import { getStudentDashboard, submitStudentReport } from "../../api/studentApi";

const FEED_PAGE_SIZE = 3;
const REPORT_WINDOW_MS = 60 * 1000;
const REPORT_LIMIT = 3;

function ClubAvatar({ logoUrl, name, size = "md" }) {
  const dimensions = size === "lg" ? "w-16 h-16 text-xl" : "w-12 h-12 text-base";
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "C";

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${dimensions} rounded-full object-cover border border-[var(--border)] bg-[var(--accent)]`}
      />
    );
  }

  return (
    <div className={`${dimensions} bg-[var(--primary-soft)] text-[var(--primary)] rounded-full flex items-center justify-center font-semibold border border-[var(--primary)]/20`}>
      {initial}
    </div>
  );
}

export default function StudentDashboard() {
  const [filter, setFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(FEED_PAGE_SIZE);
  const [reportReason, setReportReason] = useState("");
  const [reportComment, setReportComment] = useState("");
  const [reportTarget, setReportTarget] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportTimestamps, setReportTimestamps] = useState([]);
  const [dashboardData, setDashboardData] = useState({ followedClubs: [], feed: [], announcements: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadDashboard = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const { data } = await getStudentDashboard();
      setDashboardData({
        followedClubs: data.followedClubs ?? [],
        feed: data.feed ?? [],
        announcements: data.announcements ?? [],
      });
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not load your dashboard.");
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const followedClubs = dashboardData.followedClubs;
  const platformAnnouncements = dashboardData.announcements;
  const feedItems = useMemo(() => dashboardData.feed, [dashboardData.feed]);

  const filteredFeed = feedItems.filter((item) => {
    if (filter === "all") return true;
    if (filter === "posts") return item.type === "post";
    if (filter === "events") return item.type === "event";
    return true;
  });

  const visibleFeed = filteredFeed.slice(0, visibleCount);
  const hasMore = visibleCount < filteredFeed.length;

  const openReportDialog = (item) => {
    setReportTarget({
      id: item.id,
      title: item.title,
      targetModel: item.type === "event" ? "Event" : "Post",
    });
    setReportReason("");
    setReportComment("");
    setReportDialogOpen(true);
  };

  const handleReportSubmit = async () => {
    if (!reportTarget) {
      toast.error("Choose an item to report.");
      return;
    }

    if (!reportReason) {
      toast.error("Reason is required.");
      return;
    }

    const now = Date.now();
    const recent = reportTimestamps.filter((t) => now - t < REPORT_WINDOW_MS);
    if (recent.length >= REPORT_LIMIT) {
      toast.error("Rate limit reached. Please wait before submitting another report.");
      return;
    }

    setIsSubmittingReport(true);

    try {
      const { data } = await submitStudentReport({
        targetId: reportTarget.id,
        targetModel: reportTarget.targetModel,
        reason: reportReason,
        description: reportComment,
      });

      setReportTimestamps([...recent, now]);
      toast.success(data.message || "Report submitted for admin review.");
      setReportReason("");
      setReportComment("");
      setReportTarget(null);
      setReportDialogOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not submit report."));
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const formatEventDate = (value) => {
    if (!value) return "Date TBA";
    return new Date(value).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatEventTime = (value) => {
    if (!value) return "Time TBA";
    return new Date(value).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <PageContainer size="narrow">
        <PageHeader
          eyebrow="For You"
          title="Your Feed"
          subtitle="Stay updated with announcements and events from clubs you follow"
        />

        {isLoading ? (
          <Card className="p-8 text-center text-sm text-[var(--muted-foreground)]">
            Loading your dashboard...
          </Card>
        ) : loadError ? (
          <EmptyState
            icon={<Rss className="w-6 h-6" />}
            title="Could not load dashboard"
            description={loadError}
            action={<Button onClick={loadDashboard}>Try Again</Button>}
          />
        ) : (
          <>
        {platformAnnouncements.length > 0 && (
          <Section title="Platform Announcements" description="Updates from KMultaqa administrators">
            <div className="space-y-3">
              {platformAnnouncements.map((announcement) => (
                <Card key={announcement.id} className="p-5 border-l-4 border-l-[var(--primary)]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[var(--foreground)]">{announcement.title}</h3>
                        <Badge variant="info" className="text-xs">Platform</Badge>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{announcement.message}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-2">
                        {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        )}

        <Section
          title={`Following (${followedClubs.length})`}
          actions={
            <Link to="/student/explore">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Discover More
              </Button>
            </Link>
          }
        >
          <Card className="p-6">
            {followedClubs.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                You are not following any clubs yet.
              </p>
            ) : (
            <div className="flex gap-6 overflow-x-auto pb-2">
              {followedClubs.map((club) => (
                <Link key={club.id} to={`/student/club/${club.id}`}>
                  <div className="flex flex-col items-center gap-2 min-w-[80px] hover:opacity-80 transition-opacity">
                    <ClubAvatar logoUrl={club.logoUrl} name={club.clubName} size="lg" />
                    <div className="text-xs text-center font-medium truncate w-full">{club.clubName}</div>
                  </div>
                </Link>
              ))}
            </div>
            )}
          </Card>
        </Section>

        <Section>
          <Card className="p-4">
            <div className="flex gap-2">
              <Button variant={filter === "all" ? "default" : "ghost"} onClick={() => { setFilter("all"); setVisibleCount(FEED_PAGE_SIZE); }} size="sm">All Updates</Button>
              <Button variant={filter === "posts" ? "default" : "ghost"} onClick={() => { setFilter("posts"); setVisibleCount(FEED_PAGE_SIZE); }} size="sm">Announcements</Button>
              <Button variant={filter === "events" ? "default" : "ghost"} onClick={() => { setFilter("events"); setVisibleCount(FEED_PAGE_SIZE); }} size="sm">Events</Button>
            </div>
          </Card>

          {visibleFeed.length === 0 ? (
            <EmptyState
              icon={<Rss className="w-6 h-6" />}
              title="No updates yet"
              description="Follow more clubs to see their announcements and events here"
              action={
                <Link to="/student/explore">
                  <Button>
                    <Search className="w-4 h-4 mr-2" />
                    Explore Clubs
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {visibleFeed.map((item) => (
                <Card key={`${item.type}-${item.id}`} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6 pb-4">
                    <div className="flex items-start gap-3 mb-4">
                      <Link to={`/student/club/${item.clubId}`}>
                        <ClubAvatar logoUrl={item.clubLogoUrl} name={item.clubName} />
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Link to={`/student/club/${item.clubId}`}>
                            <span className="font-semibold hover:text-[var(--primary)] transition-colors">{item.clubName}</span>
                          </Link>
                          {item.type === "post" && <Badge variant="outline" className="text-xs">Announcement</Badge>}
                          {item.type === "event" && <Badge variant="default" className="text-xs">Event</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      {item.content && <p className="text-[var(--muted-foreground)]">{item.content.length > 200 ? `${item.content.substring(0, 200)}...` : item.content}</p>}
                    </div>

                    {item.type === "event" && (
                      <div className="bg-[var(--accent)]/50 rounded-lg p-4 mb-4">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-[var(--primary)]" />
                            <span>{formatEventDate(item.startDateTime)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-[var(--primary)]" />
                            <span>{formatEventTime(item.startDateTime)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-[var(--primary)]" />
                            <span>{item.location || "Location TBA"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-[var(--primary)]" />
                            <span>
                              {item.capacity
                                ? `${item.registered} / ${item.capacity} registered`
                                : `${item.registered} registered`}
                            </span>
                          </div>
                        </div>
                        <Link to={`/student/event/${item.id}`}>
                          <Button className="w-full mt-3" size="sm">
                            <ArrowUpRight className="w-4 h-4 mr-2" />
                            View & Register
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-3 border-t border-[var(--border)] flex items-center justify-end">
                    <button
                      className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                      onClick={() => openReportDialog(item)}
                    >
                      <Flag className="w-4 h-4" />
                      <span>Report</span>
                    </button>
                  </div>
                </Card>
              ))}

              {hasMore ? (
                <Button variant="outline" onClick={() => setVisibleCount((v) => v + FEED_PAGE_SIZE)}>
                  Load More
                </Button>
              ) : (
                <Card className="p-4 text-center text-sm text-[var(--muted-foreground)]">You're all caught up</Card>
              )}
            </div>
          )}
        </Section>

        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report {reportTarget?.targetModel || "Item"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {reportTarget?.title && (
                <div className="text-sm text-[var(--muted-foreground)]">
                  Reporting: <span className="font-medium text-[var(--foreground)]">{reportTarget.title}</span>
                </div>
              )}
              <div>
                <Label>Reason</Label>
                <Select value={reportReason} onValueChange={setReportReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                    <SelectItem value="misleading">Misleading Information</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="feedReportComment">Additional Comments (optional)</Label>
                <Textarea id="feedReportComment" value={reportComment} onChange={(e) => setReportComment(e.target.value)} rows={4} />
              </div>
              <Button onClick={handleReportSubmit} disabled={!reportReason || isSubmittingReport} className="w-full">
                {isSubmittingReport ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
          </>
        )}
    </PageContainer>
  );
}
