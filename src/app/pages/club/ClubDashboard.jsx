import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { LayoutDashboard, User, FileText, Calendar, Plus, Users, Eye, Heart, TrendingUp, } from "lucide-react";
import { mockPosts, mockEvents } from "../../data/mockData";

const sidebarItems = [
    { label: "Dashboard", path: "/club/dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2"/> },
    { label: "Profile Settings", path: "/club/profile", icon: <User className="w-4 h-4 mr-2"/> },
    { label: "My Posts", path: "/club/posts", icon: <FileText className="w-4 h-4 mr-2"/> },
    { label: "My Events", path: "/club/events", icon: <Calendar className="w-4 h-4 mr-2"/> },
    { label: "Followers", path: "/club/followers", icon: <Users className="w-4 h-4 mr-2"/> },
];

export default function ClubDashboard() {
    const clubPosts = mockPosts.filter(p => p.clubId === "1");
    const clubEvents = mockEvents.filter(e => e.clubId === "1");
    const totalFollowers = 542;
    const totalViews = 1247;

    return (<DashboardLayout role="club" userName="IEEE KFUPM Student Branch" userLogo="🔧" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your club overview.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/club/posts/new">
              <Button>
                <Plus className="w-4 h-4 mr-2"/>
                New Post
              </Button>
            </Link>
            <Link to="/club/events/new">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2"/>
                New Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary"/>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{totalFollowers}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <TrendingUp className="w-3 h-3"/>
              <span>+12% this week</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600"/>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{clubPosts.length}</div>
            <div className="text-sm text-muted-foreground">Total Posts</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600"/>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{clubEvents.length}</div>
            <div className="text-sm text-muted-foreground">Upcoming Events</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-amber-600"/>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{totalViews}</div>
            <div className="text-sm text-muted-foreground">Profile Views</div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Posts</h2>
              <Link to="/club/posts">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {clubPosts.slice(0, 3).map((post) => (<div key={post.id} className="pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium mb-1">{post.title}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {post.content.substring(0, 80)}...
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3"/>
                          24
                        </span>
                      </div>
                    </div>
                    {post.isPinned && (<div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                        Pinned
                      </div>)}
                  </div>
                </div>))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upcoming Events</h2>
              <Link to="/club/events">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {clubEvents.map((event) => (<div key={event.id} className="pb-4 border-b last:border-0 last:pb-0">
                  <div className="font-medium mb-1">{event.title}</div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>📍 {event.location}</span>
                    <span>{event.registrations} registered</span>
                  </div>
                </div>))}
            </div>
          </Card>
        </div>

        {/* Engagement Stats */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Engagement Overview</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-accent rounded-lg">
              <div className="text-3xl font-bold text-primary mb-1">89%</div>
              <div className="text-sm text-muted-foreground">Engagement Rate</div>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <div className="text-3xl font-bold text-primary mb-1">156</div>
              <div className="text-sm text-muted-foreground">Avg. Post Views</div>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <div className="text-3xl font-bold text-primary mb-1">4.8</div>
              <div className="text-sm text-muted-foreground">Club Rating</div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>);
}