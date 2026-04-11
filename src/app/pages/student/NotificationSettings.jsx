import { useMemo, useState } from "react";
import { StudentLayout } from "../../components/layout/StudentLayout";
import { Card } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, Settings, Calendar, Mail, Rss } from "lucide-react";
import { mockClubs } from "../../data/mockData";

const navItems = [
  { label: "Feed", path: "/student/dashboard", icon: <Rss className="w-4 h-4" /> },
  { label: "Explore Clubs", path: "/student/explore", icon: <Search className="w-4 h-4" /> },
  { label: "My Events", path: "/student/my-events", icon: <Calendar className="w-4 h-4" /> },
  { label: "Settings", path: "/student/settings", icon: <Settings className="w-4 h-4" /> }
];

export default function NotificationSettings() {
  const [emailVerified] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [followedClubIds, setFollowedClubIds] = useState(() => {
    const saved = localStorage.getItem('followedClubIds');
    return saved ? JSON.parse(saved) : ["1", "2", "3"];
  });
  const [globalSettings, setGlobalSettings] = useState(() => {
    const saved = localStorage.getItem('globalSettings');
    if (!saved) {
      return { email: "on" };
    }

    const parsed = JSON.parse(saved);

    return {
      email: typeof parsed.email === "boolean" ? (parsed.email ? "on" : "off") : (parsed.email || "on")
    };
  });
  const [clubSettings, setClubSettings] = useState(() => {
    const saved = localStorage.getItem('clubSettings');
    return saved ? JSON.parse(saved) : mockClubs.reduce((acc, club) => {
      acc[String(club.id)] = { email: true, inApp: true };
      return acc;
    }, {});
  });

  const followedClubs = useMemo(
    () => mockClubs.filter((club) => followedClubIds.includes(String(club.id))),
    [followedClubIds]
  );

  const handleToggle = (clubId, type) => {
    if (type === "email" && !emailVerified) {
      return;
    }

    setClubSettings((prev) => ({
      ...prev,
      [clubId]: {
        ...prev[clubId],
        [type]: !prev[clubId][type]
      }
    }));
  };

  const handleUnfollow = (clubId) => {
    setFollowedClubIds((prev) => prev.filter((id) => id !== clubId));
    // Remove club settings when unfollowing
    setClubSettings((prev) => {
      const updated = { ...prev };
      delete updated[clubId];
      return updated;
    });
  };

  const handleSave = () => {
    localStorage.setItem('followedClubIds', JSON.stringify(followedClubIds));
    localStorage.setItem('globalSettings', JSON.stringify(globalSettings));
    localStorage.setItem('clubSettings', JSON.stringify(clubSettings));
    setShowSaveDialog(true);
  };

  return (
    <StudentLayout userName="Ahmed Al-Qahtani" navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Clubs & Notifications</h1>
          <p className="text-muted-foreground">Manage followed clubs and notification preferences in one place</p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Global Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via university email</p>
                </div>
              </div>
              <Select
                value={globalSettings.email}
                onValueChange={(value) => setGlobalSettings((prev) => ({ ...prev, email: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on">On</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Followed Clubs</h2>
          <div className="space-y-4">
            {followedClubs.map((club) => {
              const clubId = String(club.id);
              return (
                <div key={clubId} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-2xl">{club.logo}</div>
                      <div>
                        <div className="font-semibold">{club.name}</div>
                        <div className="text-sm text-muted-foreground">{club.category}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleUnfollow(clubId)}>
                      Unfollow
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Email Notifications</Label>
                        <p className="text-xs text-muted-foreground">Get emails for new posts and events</p>
                      </div>
                      <Switch checked={clubSettings[clubId]?.email} onCheckedChange={() => handleToggle(clubId, "email")} disabled={!emailVerified} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">In-App Notifications</Label>
                        <p className="text-xs text-muted-foreground">Show notifications in the app</p>
                      </div>
                      <Switch checked={clubSettings[clubId]?.inApp} onCheckedChange={() => handleToggle(clubId, "inApp")} />
                    </div>
                  </div>
                </div>
              );
            })}
            {followedClubs.length === 0 && <p className="text-sm text-muted-foreground">You are not following any clubs.</p>}
          </div>

          <div className="pt-6">
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </Card>
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changes Saved</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Your clubs and notification preferences have been updated successfully.
          </p>
          <DialogFooter>
            <Button onClick={() => setShowSaveDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
}
