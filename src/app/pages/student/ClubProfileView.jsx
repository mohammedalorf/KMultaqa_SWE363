import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Calendar, Clock, Flag, Heart, MapPin, Users } from "lucide-react";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { EmptyState } from "../../components/layout/EmptyState";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { getApiErrorMessage } from "../../api/apiClient";
import {
  followStudentClub,
  getStudentClubProfile,
  submitStudentReport,
  unfollowStudentClub,
} from "../../api/studentApi";

const POSTS_PER_PAGE = 2;

function ClubAvatar({ logoUrl, name }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="w-24 h-24 rounded-full object-cover border border-[var(--border)] bg-[var(--accent)] shrink-0"
      />
    );
  }

  return (
    <div className="w-24 h-24 bg-[var(--primary-soft)] text-[var(--primary)] rounded-full flex items-center justify-center text-3xl font-semibold shrink-0">
      {name?.charAt(0)?.toUpperCase() || "C"}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Date TBA";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "Time TBA";

  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ClubProfileView() {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowBusy, setIsFollowBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportComment, setReportComment] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [postPage, setPostPage] = useState(1);

  const loadClub = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const { data } = await getStudentClubProfile(id);
      setClub(data.club ?? null);
      setPosts(data.posts ?? []);
      setEvents(data.events ?? []);
      setIsFollowing(Boolean(data.club?.isFollowing));
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not load club profile.");
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClub();
  }, [id]);

  const visiblePosts = useMemo(() => posts.slice(0, postPage * POSTS_PER_PAGE), [posts, postPage]);
  const hasMorePosts = visiblePosts.length < posts.length;

  const handleToggleFollow = async () => {
    if (!club) return;

    setIsFollowBusy(true);

    try {
      if (isFollowing) {
        await unfollowStudentClub(club.id);
        setIsFollowing(false);
        setClub((current) =>
          current ? { ...current, followers: Math.max((current.followers ?? 1) - 1, 0) } : current
        );
        toast.success("Unfollowed club");
      } else {
        await followStudentClub(club.id);
        setIsFollowing(true);
        setClub((current) =>
          current ? { ...current, followers: (current.followers ?? 0) + 1 } : current
        );
        toast.success("Following club");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update follow status."));
    } finally {
      setIsFollowBusy(false);
    }
  };

  const handleReport = async () => {
    if (!club) return;

    if (!reportReason) {
      toast.error("Reason is required.");
      return;
    }

    setIsReporting(true);

    try {
      await submitStudentReport({
        targetId: club.id,
        targetModel: "Club",
        reason: reportReason,
        description: reportComment,
      });
      toast.success("Report submitted for admin review.");
      setReportReason("");
      setReportComment("");
      setReportOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not submit report."));
    } finally {
      setIsReporting(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Card className="p-8 text-center text-sm text-[var(--muted-foreground)]">
          Loading club profile...
        </Card>
      </PageContainer>
    );
  }

  if (loadError || !club) {
    return (
      <PageContainer>
        <EmptyState title="Club not found" description={loadError || "This club is not available."} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Discover"
        title={club.clubName}
        subtitle={club.description}
        actions={
          <>
            <Button variant={isFollowing ? "secondary" : "default"} onClick={handleToggleFollow} disabled={isFollowBusy}>
              <Heart className={`w-4 h-4 mr-2 ${isFollowing ? "fill-current" : ""}`} />
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Report club">
                  <Flag className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report Club</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
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
                    <Label htmlFor="comment">Additional Comments (optional)</Label>
                    <Textarea id="comment" value={reportComment} onChange={(event) => setReportComment(event.target.value)} rows={4} />
                  </div>
                  <Button onClick={handleReport} disabled={!reportReason || isReporting} className="w-full">
                    {isReporting ? "Submitting..." : "Submit Report"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <Section>
        <Card className="p-6">
          <div className="flex items-start gap-6">
            <ClubAvatar logoUrl={club.logoUrl} name={club.clubName} />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline">{club.category}</Badge>
                <Badge variant="success">{club.status}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span>{club.followers} followers</span>
                </div>
                <div className="text-[var(--muted-foreground)]">{club.email}</div>
              </div>
            </div>
          </div>
        </Card>
      </Section>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {visiblePosts.length === 0 ? (
            <EmptyState title="No posts yet" description="This club has not posted anything yet." />
          ) : (
            visiblePosts.map((post) => (
              <Card key={post.id} className="p-6">
                <div className="flex items-start gap-3">
                  <ClubAvatar logoUrl={club.logoUrl} name={club.clubName} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{club.clubName}</span>
                      {post.isPinned && <Badge variant="default" className="text-xs">Pinned</Badge>}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <p className="text-[var(--muted-foreground)] mb-3">{post.content}</p>
                    <div className="text-sm text-[var(--muted-foreground)]">{formatDate(post.createdAt)}</div>
                  </div>
                </div>
              </Card>
            ))
          )}

          {hasMorePosts && (
            <Button variant="outline" onClick={() => setPostPage((page) => page + 1)}>
              Load More Posts
            </Button>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {events.length === 0 ? (
            <EmptyState title="No upcoming events" description="Check back soon for new events." />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {events.map((event) => (
                <Link key={event.id} to={`/student/event/${event.id}`}>
                  <Card className="p-6 hover:bg-[var(--accent)] transition-colors">
                    <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] mb-4">{event.content}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                        <span>{formatDate(event.startDateTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />
                        <span>{formatTime(event.startDateTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[var(--muted-foreground)]" />
                        <span>{event.location || "Location TBA"}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4">View Event</Button>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="about">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">About {club.clubName}</h3>
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <div>{club.category}</div>
              </div>
              <div>
                <Label>Description</Label>
                <div className="text-[var(--muted-foreground)]">{club.description}</div>
              </div>
              <div>
                <Label>Contact Information</Label>
                <div className="text-[var(--muted-foreground)]">{club.email}</div>
              </div>
              <div>
                <Label>Followers</Label>
                <div className="text-[var(--muted-foreground)]">{club.followers} students</div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
