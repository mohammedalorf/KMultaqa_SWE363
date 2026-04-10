import { useMemo, useState } from "react";
import { StudentLayout } from "../../components/layout/StudentLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Link } from "react-router-dom";
import { Rss, Search, Settings, Calendar, Heart, MessageSquare, Share2, Clock, MapPin, Users, ArrowUpRight, Flag } from "lucide-react";
import { mockClubs, mockEvents, mockPosts } from "../../data/mockData";
import { toast } from "sonner";

const navItems = [
  { label: "Feed", path: "/student/dashboard", icon: <Rss className="w-4 h-4" /> },
  { label: "Explore Clubs", path: "/student/explore", icon: <Search className="w-4 h-4" /> },
  { label: "My Events", path: "/student/my-events", icon: <Calendar className="w-4 h-4" /> },
  { label: "Settings", path: "/student/settings", icon: <Settings className="w-4 h-4" /> }
];

const FEED_PAGE_SIZE = 3;
const REPORT_WINDOW_MS = 60 * 1000;
const REPORT_LIMIT = 3;

export default function StudentDashboard() {
  const [filter, setFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(FEED_PAGE_SIZE);
  const [reportReason, setReportReason] = useState("");
  const [reportComment, setReportComment] = useState("");
  const [reportTarget, setReportTarget] = useState("");
  const [reportTimestamps, setReportTimestamps] = useState([]);

  const followedClubs = mockClubs.slice(0, 3);
  const followedClubIds = followedClubs.map((club) => club.id);

  const feedItems = useMemo(
    () =>
      [
        ...mockPosts
          .filter((post) => followedClubIds.includes(post.clubId))
          .filter((post) => !post.isHidden && !post.isRemoved)
          .map((post) => ({
            id: `post-${post.id}`,
            type: "post",
            clubName: post.clubName,
            clubLogo: post.clubLogo,
            clubId: post.clubId,
            title: post.title,
            content: post.content,
            postType: post.type,
            createdAt: post.createdAt,
            likes: Math.floor(Math.random() * 100) + 10,
            comments: Math.floor(Math.random() * 30) + 2
          })),
        ...mockEvents
          .filter((event) => followedClubIds.includes(event.clubId))
          .filter((event) => !event.isHidden && !event.isRemoved)
          .map((event) => ({
            id: `event-${event.id}`,
            type: "event",
            clubName: event.clubName,
            clubLogo: event.clubLogo,
            clubId: event.clubId,
            title: event.title,
            content: event.description,
            date: event.date,
            time: event.time,
            location: event.location,
            capacity: event.maxAttendees || 100,
            registered: event.attendees || 0,
            createdAt: event.createdAt || new Date().toISOString(),
            likes: Math.floor(Math.random() * 50) + 5,
            comments: Math.floor(Math.random() * 20) + 1
          }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [followedClubIds]
  );

  const filteredFeed = feedItems.filter((item) => {
    if (filter === "all") return true;
    if (filter === "posts") return item.type === "post";
    if (filter === "events") return item.type === "event";
    return true;
  });

  const visibleFeed = filteredFeed.slice(0, visibleCount);
  const hasMore = visibleCount < filteredFeed.length;

  const handleLike = (itemId) => {
    toast.success(`Liked ${itemId}`);
  };

  const handleShare = (itemId) => {
    toast.success(`Shared ${itemId}`);
  };

  const handleReportSubmit = () => {
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

    setReportTimestamps([...recent, now]);
    toast.success(`Report submitted for ${reportTarget}.`);
    setReportReason("");
    setReportComment("");
  };

  return (
    <StudentLayout userName="Ahmed Al-Qahtani" navItems={navItems}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Feed</h1>
          <p className="text-muted-foreground">Stay updated with announcements and events from clubs you follow</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Following ({followedClubs.length})</h2>
            <Link to="/student/explore">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Discover More
              </Button>
            </Link>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {followedClubs.map((club) => (
              <Link key={club.id} to={`/student/club/${club.id}`}>
                <div className="flex flex-col items-center gap-2 min-w-[80px] hover:opacity-80 transition-opacity">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center text-2xl border-2 border-primary">
                    {club.logo}
                  </div>
                  <div className="text-xs text-center font-medium truncate w-full">{club.name.split(" ")[0]}</div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex gap-2">
            <Button variant={filter === "all" ? "default" : "ghost"} onClick={() => { setFilter("all"); setVisibleCount(FEED_PAGE_SIZE); }} size="sm">All Updates</Button>
            <Button variant={filter === "posts" ? "default" : "ghost"} onClick={() => { setFilter("posts"); setVisibleCount(FEED_PAGE_SIZE); }} size="sm">Announcements</Button>
            <Button variant={filter === "events" ? "default" : "ghost"} onClick={() => { setFilter("events"); setVisibleCount(FEED_PAGE_SIZE); }} size="sm">Events</Button>
          </div>
        </Card>

        {visibleFeed.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Rss className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No updates yet</h3>
            <p className="text-muted-foreground mb-6">Follow more clubs to see their announcements and events here</p>
            <Link to="/student/explore">
              <Button>
                <Search className="w-4 h-4 mr-2" />
                Explore Clubs
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {visibleFeed.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 pb-4">
                  <div className="flex items-start gap-3 mb-4">
                    <Link to={`/student/club/${item.clubId}`}>
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-2xl hover:opacity-80 transition-opacity">{item.clubLogo}</div>
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link to={`/student/club/${item.clubId}`}>
                          <span className="font-semibold hover:text-primary transition-colors">{item.clubName}</span>
                        </Link>
                        {item.type === "post" && item.postType && <Badge variant="outline" className="text-xs">{item.postType}</Badge>}
                        {item.type === "event" && <Badge className="text-xs bg-primary/10 text-primary hover:bg-primary/20">Event</Badge>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    {item.content && <p className="text-muted-foreground">{item.content.length > 200 ? `${item.content.substring(0, 200)}...` : item.content}</p>}
                  </div>

                  {item.type === "event" && (
                    <div className="bg-accent/50 rounded-lg p-4 mb-4">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{item.date && new Date(item.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{item.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-primary" />
                          <span>{item.registered} / {item.capacity} registered</span>
                        </div>
                      </div>
                      <Link to={`/student/event/${item.id.replace("event-", "")}`}>
                        <Button className="w-full mt-3" size="sm">
                          <ArrowUpRight className="w-4 h-4 mr-2" />
                          View & Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                <div className="px-6 py-3 border-t border-border flex items-center gap-6">
                  <button onClick={() => handleLike(item.id)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Heart className="w-4 h-4" />
                    <span>{item.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>{item.comments}</span>
                  </button>
                  <button onClick={() => handleShare(item.id)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  {item.type === "post" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setReportTarget(item.id)}>
                          <Flag className="w-4 h-4" />
                          <span>Report</span>
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Report Post</DialogTitle>
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
                            <Label htmlFor="feedReportComment">Additional Comments (optional)</Label>
                            <Textarea id="feedReportComment" value={reportComment} onChange={(e) => setReportComment(e.target.value)} rows={4} />
                          </div>
                          <Button onClick={handleReportSubmit} disabled={!reportReason} className="w-full">Submit Report</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </Card>
            ))}

            {hasMore ? (
              <Button variant="outline" onClick={() => setVisibleCount((v) => v + FEED_PAGE_SIZE)}>
                Load More
              </Button>
            ) : (
              <Card className="p-4 text-center text-sm text-muted-foreground">You're all caught up</Card>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
