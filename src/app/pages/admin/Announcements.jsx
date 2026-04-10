import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { LayoutDashboard, CheckSquare, Flag, Users, Megaphone, Scale, FileText, Settings, Send, Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const sidebarItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
  { label: "Club Approvals", path: "/admin/club-approvals", icon: <CheckSquare className="w-4 h-4 mr-2" /> },
  { label: "Reports", path: "/admin/reports", icon: <Flag className="w-4 h-4 mr-2" /> },
  { label: "Club Management", path: "/admin/club-management", icon: <Users className="w-4 h-4 mr-2" /> },
  { label: "Announcements", path: "/admin/announcements", icon: <Megaphone className="w-4 h-4 mr-2" /> },
  { label: "Appeals", path: "/admin/appeals", icon: <Scale className="w-4 h-4 mr-2" /> },
  { label: "Export Reports", path: "/admin/export", icon: <FileText className="w-4 h-4 mr-2" /> },
  { label: "Settings", path: "/admin/settings", icon: <Settings className="w-4 h-4 mr-2" /> }
];

const TITLE_MIN = 8;
const TITLE_MAX = 120;
const CONTENT_MIN = 20;
const CONTENT_MAX = 2000;

export default function Announcements() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("all");
  const [publishDate, setPublishDate] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const validateAnnouncement = () => {
    const titleTrimmed = title.trim();
    const contentTrimmed = content.trim();

    if (titleTrimmed.length < TITLE_MIN || titleTrimmed.length > TITLE_MAX) {
      return `Title must be between ${TITLE_MIN} and ${TITLE_MAX} characters.`;
    }

    if (contentTrimmed.length < CONTENT_MIN || contentTrimmed.length > CONTENT_MAX) {
      return `Content must be between ${CONTENT_MIN} and ${CONTENT_MAX} characters.`;
    }

    if (publishDate && publishDate <= todayIso) {
      return "Scheduled publish date must be in the future.";
    }

    return "";
  };

  const handlePublish = () => {
    const validationError = validateAnnouncement();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    toast.success(publishDate ? "Announcement scheduled successfully!" : "Announcement published successfully!");
    setTitle("");
    setContent("");
    setAudience("all");
    setPublishDate("");
    setShowPreview(false);
  };

  const handlePreview = () => {
    const validationError = validateAnnouncement();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setShowPreview(true);
  };

  return (
    <DashboardLayout role="admin" userName="Dr. Abdullah Al-Mutairi" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Platform Announcements</h1>
          <p className="text-muted-foreground">Create and publish announcements for the platform</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Create New Announcement</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter announcement title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">{title.trim().length}/{TITLE_MAX} characters</p>
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your announcement content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                />
                <p className="text-xs text-muted-foreground mt-1">{content.trim().length}/{CONTENT_MAX} characters</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="audience">Audience</Label>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="clubs">Clubs Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="publishDate">Publish Date (Optional)</Label>
                  <Input id="publishDate" type="date" min={todayIso} value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">If set, date must be after today.</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handlePublish} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  {publishDate ? "Schedule" : "Publish Now"}
                </Button>
                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Announcements</h2>
            <Card className="p-4">
              <div className="text-sm font-semibold mb-1">Welcome to Spring 2026 Semester</div>
              <div className="text-xs text-muted-foreground mb-2">Published: Feb 1, 2026</div>
              <div className="text-sm text-muted-foreground">Welcome back students! New clubs and events...</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm font-semibold mb-1">Club Fair Next Week</div>
              <div className="text-xs text-muted-foreground mb-2">Published: Feb 15, 2026</div>
              <div className="text-sm text-muted-foreground">Don't miss the annual club fair on campus...</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm font-semibold mb-1">Platform Maintenance Notice</div>
              <div className="text-xs text-muted-foreground mb-2">Published: Feb 20, 2026</div>
              <div className="text-sm text-muted-foreground">The platform will undergo maintenance...</div>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Announcement Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground">Audience</div>
              <div className="font-medium capitalize">{audience}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Title</div>
              <h3 className="text-xl font-semibold">{title}</h3>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Content</div>
              <p className="text-sm whitespace-pre-wrap">{content}</p>
            </div>
            {publishDate && (
              <div>
                <div className="text-xs text-muted-foreground">Scheduled Date</div>
                <div className="font-medium">{publishDate}</div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
