import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  Clock,
  FileText,
  Flag,
  Heart,
  MapPin,
  Pin,
  Users,
} from "lucide-react";
import { EmptyState } from "../../components/layout/EmptyState";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { getApiErrorMessage } from "../../api/apiClient";
import {
  followStudentClub,
  getStudentClubProfile,
  likeStudentPost,
  submitStudentReport,
  unfollowStudentClub,
  unlikeStudentPost,
  updateStudentClubNotifications,
} from "../../api/studentApi";

const POSTS_PER_PAGE = 2;
const defaultAccentColor = "#1e3a5f";
const defaultBackgroundColor = "#f8fafc";
const defaultCardColor = "#ffffff";
const defaultPrimaryTextColor = "#111827";
const defaultSecondaryTextColor = "#6b7280";
const tabItems = ["posts", "events", "about"];

function getAccentColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : defaultAccentColor;
}

function getBackgroundColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : defaultBackgroundColor;
}

function getCardColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : defaultCardColor;
}

function getPrimaryTextColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : defaultPrimaryTextColor;
}

function getSecondaryTextColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : defaultSecondaryTextColor;
}

function hexToRgba(hex, alpha) {
  const normalized = getAccentColor(hex).replace("#", "");
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getLogoShapeClass(shape) {
  return shape === "rounded-square" ? "rounded-2xl" : "rounded-full";
}

function ClubAvatar({ logoUrl, name, logoShape = "circle", hero = false }) {
  const sizeClass = hero ? "h-[100px] w-[100px] text-4xl" : "h-12 w-12 text-base";
  const borderClass = hero ? "border-4 border-white shadow-[var(--shadow-md)]" : "";
  const shapeClass = getLogoShapeClass(logoShape);

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${sizeClass} ${borderClass} ${shapeClass} bg-[var(--card)] object-cover shrink-0`}
      />
    );
  }

  return (
    <div className={`${sizeClass} ${borderClass} ${shapeClass} bg-[var(--card)] text-[var(--primary)] flex items-center justify-center font-semibold shrink-0`}>
      {name?.charAt(0)?.toUpperCase() || "C"}
    </div>
  );
}

function ProfileStat({ icon, value, label, accentColor, cardColor, onClick }) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-left text-[var(--card-foreground)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--accent)]/35"
      style={{ backgroundColor: cardColor, borderColor: "transparent", color: "var(--profile-primary-text)" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold">{value}</div>
          <div className="text-sm text-[var(--profile-secondary-text)]">{label}</div>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: hexToRgba(accentColor, 0.14), color: accentColor }}
        >
          {icon}
        </div>
      </div>
    </Component>
  );
}

function AboutRow({ label, children }) {
  return (
    <div>
      <div className="text-sm font-medium">{label}</div>
      <div className="mt-1 text-sm text-[var(--profile-secondary-text)]">{children}</div>
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

function FullScreenProfileShell({
  children,
  backgroundColor = "var(--background)",
  primaryTextColor = defaultPrimaryTextColor,
  secondaryTextColor = defaultSecondaryTextColor,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/student/explore");
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{
        backgroundColor,
        color: primaryTextColor,
        "--profile-primary-text": primaryTextColor,
        "--profile-secondary-text": secondaryTextColor,
      }}
    >
      <button
        type="button"
        onClick={handleBack}
        aria-label="Go back"
        className="fixed left-4 top-4 z-[60] flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]/95 text-[var(--foreground)] shadow-[var(--shadow-md)] backdrop-blur transition-colors hover:bg-[var(--accent)]"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <main className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
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
  const [likingPostIds, setLikingPostIds] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [followersOpen, setFollowersOpen] = useState(false);
  const [isNotificationBusy, setIsNotificationBusy] = useState(false);
  const tabsRef = useRef(null);

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
  const accentColor = getAccentColor(club?.accentColor ?? club?.themeColor);
  const backgroundColor = getBackgroundColor(club?.backgroundColor);
  const cardColor = getCardColor(club?.cardColor);
  const primaryTextColor = getPrimaryTextColor(club?.primaryTextColor);
  const secondaryTextColor = getSecondaryTextColor(club?.secondaryTextColor);

  const scrollToTabs = () => {
    window.requestAnimationFrame(() => {
      tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleStatTabClick = (tab) => {
    setActiveTab(tab);
    scrollToTabs();
  };

  const handleToggleFollow = async () => {
    if (!club) return;

    setIsFollowBusy(true);

    try {
      if (isFollowing) {
        await unfollowStudentClub(club.id);
        setIsFollowing(false);
        setClub((current) =>
          current
            ? {
                ...current,
                followers: Math.max((current.followers ?? 1) - 1, 0),
                notificationsEnabled: false,
              }
            : current
        );
        toast.success("Unfollowed club");
      } else {
        const { data } = await followStudentClub(club.id);
        setIsFollowing(true);
        setClub((current) =>
          current
            ? {
                ...current,
                followers: (current.followers ?? 0) + 1,
                notificationsEnabled: data.notificationsEnabled ?? true,
              }
            : current
        );
        toast.success("Following club");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update follow status."));
    } finally {
      setIsFollowBusy(false);
    }
  };

  const handleToggleNotifications = async () => {
    if (!club || !isFollowing) return;

    const nextValue = !club.notificationsEnabled;
    setIsNotificationBusy(true);

    try {
      const { data } = await updateStudentClubNotifications(club.id, nextValue);
      setClub((current) =>
        current ? { ...current, notificationsEnabled: data.notificationsEnabled } : current
      );
      toast.success(data.message || (nextValue ? "Notifications enabled" : "Notifications disabled"));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update notifications."));
    } finally {
      setIsNotificationBusy(false);
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

  const handleTogglePostLike = async (post) => {
    setLikingPostIds((current) => [...new Set([...current, post.id])]);

    try {
      const { data } = post.isLiked
        ? await unlikeStudentPost(post.id)
        : await likeStudentPost(post.id);
      const updatedPost = data.post;

      setPosts((current) =>
        current.map((item) =>
          item.id === updatedPost.id ? { ...item, ...updatedPost } : item
        )
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update post like."));
    } finally {
      setLikingPostIds((current) => current.filter((postId) => postId !== post.id));
    }
  };

  if (isLoading) {
    return (
      <FullScreenProfileShell>
        <Card className="p-8 text-center text-sm text-[var(--muted-foreground)]">
          Loading club profile...
        </Card>
      </FullScreenProfileShell>
    );
  }

  if (loadError || !club) {
    return (
      <FullScreenProfileShell>
        <EmptyState title="Club not found" description={loadError || "This club is not available."} />
      </FullScreenProfileShell>
    );
  }

  return (
    <FullScreenProfileShell
      backgroundColor={backgroundColor}
      primaryTextColor={primaryTextColor}
      secondaryTextColor={secondaryTextColor}
    >
      <section className="mb-6">
        <div className="relative">
          <div className="h-56 overflow-hidden rounded-xl sm:h-72">
            {club.bannerUrl ? (
              <img src={club.bannerUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${hexToRgba(accentColor, 0.52)})`,
                }}
              />
            )}
            <div className="absolute inset-0 rounded-xl bg-black/10" />
          </div>

          <div className="absolute bottom-0 left-6 translate-y-1/2">
            <ClubAvatar logoUrl={club.logoUrl} name={club.clubName} logoShape={club.logoShape} hero />
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-16 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="ml-6 text-3xl font-semibold" style={{ color: primaryTextColor }}>{club.clubName}</h2>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleToggleFollow}
              disabled={isFollowBusy}
              style={
                isFollowing
                  ? { borderColor: accentColor, color: accentColor }
                  : { backgroundColor: accentColor, borderColor: accentColor, color: "#fff" }
              }
            >
              <Heart className={`h-4 w-4 ${isFollowing ? "fill-current" : ""}`} />
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleNotifications}
              disabled={!isFollowing || isNotificationBusy}
              aria-label={club.notificationsEnabled ? "Disable notifications" : "Enable notifications"}
              style={isFollowing ? { borderColor: accentColor, color: accentColor } : undefined}
            >
              {club.notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>
            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Report club">
                  <Flag className="h-4 w-4" />
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
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <ProfileStat
          icon={<Users className="h-5 w-5" />}
          value={club.followers ?? 0}
          label="Followers"
          accentColor={accentColor}
          cardColor={cardColor}
          onClick={() => setFollowersOpen(true)}
        />
        <ProfileStat
          icon={<Calendar className="h-5 w-5" />}
          value={events.length}
          label="Events"
          accentColor={accentColor}
          cardColor={cardColor}
          onClick={() => handleStatTabClick("events")}
        />
        <ProfileStat
          icon={<FileText className="h-5 w-5" />}
          value={posts.length}
          label="Posts"
          accentColor={accentColor}
          cardColor={cardColor}
          onClick={() => handleStatTabClick("posts")}
        />
      </section>

      <div ref={tabsRef} className="mb-6 scroll-mt-20">
        <div className="flex gap-6">
          {tabItems.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-1 pb-3 text-sm capitalize transition-colors ${
                  isActive ? "font-semibold text-[var(--profile-primary-text)]" : "border-transparent text-[var(--profile-secondary-text)] hover:text-[var(--profile-primary-text)]"
                }`}
                style={{ borderBottomColor: isActive ? accentColor : "transparent" }}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "posts" && (
        <div className="space-y-4">
          {visiblePosts.length === 0 ? (
            <EmptyState title="No posts yet" description="This club has not posted anything yet." />
          ) : (
            visiblePosts.map((post) => (
              <Card
                key={post.id}
                className="p-6"
                style={
                  post.isPinned
                    ? {
                        background: `linear-gradient(135deg, ${hexToRgba(accentColor, 0.1)}, ${cardColor} 54%)`,
                        borderColor: hexToRgba(accentColor, 0.28),
                        color: primaryTextColor,
                      }
                    : { backgroundColor: cardColor, borderColor: "transparent", color: primaryTextColor }
                }
              >
                <div className="flex items-start gap-3">
                  <ClubAvatar logoUrl={club.logoUrl} name={club.clubName} logoShape={club.logoShape} />
                  <div className="min-w-0 flex-1 pt-2">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xl font-semibold" style={{ color: primaryTextColor }}>{club.clubName}</span>
                      {post.isPinned && (
                        <Badge variant="outline" className="text-xs" style={{ borderColor: accentColor, color: accentColor }}>
                          <Pin className="h-3 w-3" />
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <h3 className="mb-2 text-base font-semibold" style={{ color: primaryTextColor }}>{post.title}</h3>
                    <p className="mb-3 text-[var(--profile-secondary-text)]">{post.content}</p>
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="" className="mb-4 max-h-80 w-full rounded-lg object-cover" />
                    )}
                    <div className="flex items-center justify-between gap-3 text-sm text-[var(--profile-secondary-text)]">
                      <span>{formatDate(post.createdAt)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePostLike(post)}
                        disabled={likingPostIds.includes(post.id)}
                        style={{ color: accentColor }}
                        aria-label={post.isLiked ? "Unlike post" : "Like post"}
                      >
                        <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                        <span>{post.likesCount ?? 0}</span>
                      </Button>
                    </div>
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
        </div>
      )}

      {activeTab === "events" && (
        <div className="space-y-4">
          {events.length === 0 ? (
            <EmptyState title="No upcoming events" description="Check back soon for new events." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((event) => (
                <Link key={event.id} to={`/student/event/${event.id}`}>
                  <Card className="overflow-hidden transition-colors hover:bg-[var(--accent)]" style={{ backgroundColor: cardColor, borderColor: "transparent", color: primaryTextColor }}>
                    {event.imageUrl && <img src={event.imageUrl} alt="" className="h-40 w-full object-cover" />}
                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-semibold" style={{ color: primaryTextColor }}>{event.title}</h3>
                      <p className="mb-4 text-sm text-[var(--profile-secondary-text)]">{event.content}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[var(--profile-secondary-text)]" />
                          <span>{formatDate(event.startDateTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[var(--profile-secondary-text)]" />
                          <span>{event.hasStartTime === false ? "Time TBA" : formatTime(event.startDateTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[var(--profile-secondary-text)]" />
                          <span>{event.location || "Location TBA"}</span>
                        </div>
                      </div>
                      <Button className="mt-4 w-full" style={{ backgroundColor: accentColor, color: "#fff" }}>
                        View Event
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "about" && (
        <Card className="p-6" style={{ backgroundColor: cardColor, borderColor: "transparent", color: primaryTextColor }}>
          <h2 className="mb-5 text-xl font-semibold" style={{ color: primaryTextColor }}>About</h2>
          <div className="space-y-5">
            <AboutRow label="Category">
              <span className="capitalize">{club.category}</span>
            </AboutRow>
            <AboutRow label="Description">
              {club.description}
            </AboutRow>
            <AboutRow label="Contact">
              {club.email}
            </AboutRow>
          </div>
        </Card>
      )}

      <Dialog open={followersOpen} onOpenChange={setFollowersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
          </DialogHeader>
          {(club.followersList ?? []).length === 0 ? (
            <p className="text-sm text-[var(--profile-secondary-text)]">No followers yet.</p>
          ) : (
            <div className="space-y-3">
              {club.followersList.map((follower) => (
                <div key={follower.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3" style={{ backgroundColor: cardColor, borderColor: "transparent", color: primaryTextColor }}>
                  <div>
                    <div className="font-medium">{follower.fullName}</div>
                    <div className="text-sm text-[var(--profile-secondary-text)]">{follower.studentId}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </FullScreenProfileShell>
  );
}
