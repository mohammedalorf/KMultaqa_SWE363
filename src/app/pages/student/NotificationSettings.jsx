import { useState } from "react";
import { StudentLayout } from "../../components/layout/StudentLayout";
import { Card } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Search, Settings, Calendar, Bell, Mail, Rss, } from "lucide-react";
import { mockClubs } from "../../data/mockData";
import { toast } from "sonner";
const navItems = [
    { label: "Feed", path: "/student/dashboard", icon: <Rss className="w-4 h-4"/> },
    { label: "Explore Clubs", path: "/student/explore", icon: <Search className="w-4 h-4"/> },
    { label: "My Events", path: "/student/my-events", icon: <Calendar className="w-4 h-4"/> },
    { label: "Settings", path: "/student/settings", icon: <Settings className="w-4 h-4"/> },
];
export default function NotificationSettings() {
    const followedClubs = mockClubs.slice(0, 3);
    const [clubSettings, setClubSettings] = useState(followedClubs.reduce((acc, club) => ({
        ...acc,
        [club.id]: { email: true, inApp: true }
    }), {}));
    const handleToggle = (clubId, type) => {
        setClubSettings({
            ...clubSettings,
            [clubId]: {
                ...clubSettings[clubId],
                [type]: !clubSettings[clubId][type]
            }
        });
        toast.success("Notification settings updated");
    };
    return (<StudentLayout userName="Ahmed Al-Qahtani" navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">
            Manage your notification preferences for followed clubs
          </p>
        </div>

        {/* Global Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Global Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary"/>
                <div>
                  <Label>In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications within the platform
                  </p>
                </div>
              </div>
              <Switch defaultChecked/>
            </div>
            <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary"/>
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch defaultChecked/>
            </div>
          </div>
        </Card>

        {/* Per-Club Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Followed Clubs</h2>
          <div className="space-y-4">
            {followedClubs.map((club) => (<div key={club.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-2xl">
                    {club.logo}
                  </div>
                  <div>
                    <div className="font-semibold">{club.name}</div>
                    <div className="text-sm text-muted-foreground">{club.category}</div>
                  </div>
                </div>
                <div className="space-y-3 pl-15">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Get emails for new posts and events
                      </p>
                    </div>
                    <Switch checked={clubSettings[club.id]?.email} onCheckedChange={() => handleToggle(club.id, 'email')}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">In-App Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Show notifications in the app
                      </p>
                    </div>
                    <Switch checked={clubSettings[club.id]?.inApp} onCheckedChange={() => handleToggle(club.id, 'inApp')}/>
                  </div>
                </div>
              </div>))}
          </div>
        </Card>

        {/* Notification Types */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Notification Types</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border-b border-border last:border-0">
              <div>
                <Label>New Posts</Label>
                <p className="text-sm text-muted-foreground">
                  When clubs you follow publish new posts
                </p>
              </div>
              <Switch defaultChecked/>
            </div>
            <div className="flex items-center justify-between p-3 border-b border-border last:border-0">
              <div>
                <Label>New Events</Label>
                <p className="text-sm text-muted-foreground">
                  When clubs you follow create new events
                </p>
              </div>
              <Switch defaultChecked/>
            </div>
            <div className="flex items-center justify-between p-3 border-b border-border last:border-0">
              <div>
                <Label>Event Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Reminders for events you've registered for
                </p>
              </div>
              <Switch defaultChecked/>
            </div>
            <div className="flex items-center justify-between p-3 border-b border-border last:border-0">
              <div>
                <Label>Platform Announcements</Label>
                <p className="text-sm text-muted-foreground">
                  Important updates from KFUPM Clubs Platform
                </p>
              </div>
              <Switch defaultChecked/>
            </div>
          </div>
        </Card>
      </div>
    </StudentLayout>);
}