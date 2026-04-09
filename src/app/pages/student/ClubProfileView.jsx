import { StudentLayout } from "../../components/layout/StudentLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Search, Settings, Calendar, Heart, Users, MapPin, Rss, Flag, } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { mockClubs, mockPosts, mockEvents } from "../../data/mockData";
import { useState } from "react";
import { toast } from "sonner";
const navItems = [
    { label: "Feed", path: "/student/dashboard", icon: <Rss className="w-4 h-4"/> },
    { label: "Explore Clubs", path: "/student/explore", icon: <Search className="w-4 h-4"/> },
    { label: "My Events", path: "/student/my-events", icon: <Calendar className="w-4 h-4"/> },
    { label: "Settings", path: "/student/settings", icon: <Settings className="w-4 h-4"/> },
];
export default function ClubProfileView() {
    const { id } = useParams();
    const [isFollowing, setIsFollowing] = useState(["1", "2", "3"].includes(id || ""));
    const [reportReason, setReportReason] = useState("");
    const [reportComment, setReportComment] = useState("");
    const club = mockClubs.find((c) => c.id === id);
    const clubPosts = mockPosts.filter((p) => p.clubId === id);
    const clubEvents = mockEvents.filter((e) => e.clubId === id);
    if (!club) {
        return <div>Club not found</div>;
    }
    const handleToggleFollow = () => {
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? "Unfollowed club" : "Following club");
    };
    const handleReport = () => {
        if (reportReason && reportComment.trim()) {
            toast.success("Report submitted for review");
            setReportReason("");
            setReportComment("");
        }
    };
    return (<StudentLayout userName="Ahmed Al-Qahtani" navItems={navItems}>
      <div className="space-y-6">
        {/* Club Header */}
        <Card className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-5xl">
              {club.logo}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{club.name}</h1>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline">{club.category}</Badge>
                    <Badge variant={club.status === "active" ? "default" : "secondary"}>
                      {club.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant={isFollowing ? "secondary" : "default"} onClick={handleToggleFollow}>
                    {isFollowing ? (<>
                        <Heart className="w-4 h-4 mr-2 fill-current"/>
                        Following
                      </>) : (<>
                        <Heart className="w-4 h-4 mr-2"/>
                        Follow
                      </>)}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Flag className="w-4 h-4"/>
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
                              <SelectValue placeholder="Select a reason"/>
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
                          <Label htmlFor="comment">Additional Comments</Label>
                          <Textarea id="comment" placeholder="Provide more details..." value={reportComment} onChange={(e) => setReportComment(e.target.value)} rows={4}/>
                        </div>
                        <Button onClick={handleReport} disabled={!reportReason || !reportComment.trim()} className="w-full">
                          Submit Report
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">{club.bio}</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground"/>
                  <span>{club.followers} followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📧</span>
                  <span>{club.contact}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {clubPosts.map((post) => (<Card key={post.id} className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-xl">
                    {club.logo}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{club.name}</span>
                      <Badge variant="outline" className="text-xs">{post.type}</Badge>
                      {post.isPinned && (<Badge variant="default" className="text-xs">Pinned</Badge>)}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <p className="text-muted-foreground mb-3">{post.content}</p>
                    <div className="text-sm text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>))}
            {clubPosts.length === 0 && (<Card className="p-12 text-center">
                <p className="text-muted-foreground">No posts yet</p>
              </Card>)}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {clubEvents.map((event) => (<Link key={event.id} to={`/student/event/${event.id}`}>
                  <Card className="p-6 hover:bg-accent transition-colors">
                    <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {event.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground"/>
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🕐</span>
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground"/>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4">Register for Event</Button>
                  </Card>
                </Link>))}
            </div>
            {clubEvents.length === 0 && (<Card className="p-12 text-center">
                <p className="text-muted-foreground">No upcoming events</p>
              </Card>)}
          </TabsContent>

          <TabsContent value="about">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">About {club.name}</h3>
              <div className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <div>{club.category}</div>
                </div>
                <div>
                  <Label>Description</Label>
                  <div className="text-muted-foreground">{club.bio}</div>
                </div>
                <div>
                  <Label>Contact Information</Label>
                  <div className="text-muted-foreground">{club.contact}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={club.status === "active" ? "default" : "secondary"}>
                    {club.status}
                  </Badge>
                </div>
                <div>
                  <Label>Followers</Label>
                  <div className="text-muted-foreground">{club.followers} students</div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>);
}