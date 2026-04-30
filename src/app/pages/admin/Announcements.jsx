import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Send } from "lucide-react";
import { getApiErrorMessage } from "../../api/apiClient";
import { createAdminAnnouncement, getAdminAnnouncements } from "../../api/adminApi";

const TITLE_MIN = 8;
const TITLE_MAX = 120;
const CONTENT_MIN = 20;
const CONTENT_MAX = 2000;

export default function Announcements() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("all");
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAnnouncements() {
      setIsLoading(true);

      try {
        const { data } = await getAdminAnnouncements();

        if (!cancelled) {
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error, "Could not load announcements."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadAnnouncements();

    return () => {
      cancelled = true;
    };
  }, []);

  const validateAnnouncement = () => {
    const titleTrimmed = title.trim();
    const contentTrimmed = content.trim();

    if (titleTrimmed.length < TITLE_MIN || titleTrimmed.length > TITLE_MAX) {
      return `Title must be between ${TITLE_MIN} and ${TITLE_MAX} characters.`;
    }

    if (contentTrimmed.length < CONTENT_MIN || contentTrimmed.length > CONTENT_MAX) {
      return `Content must be between ${CONTENT_MIN} and ${CONTENT_MAX} characters.`;
    }

    return "";
  };

  const handlePublish = async () => {
    const validationError = validateAnnouncement();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsPublishing(true);

    try {
      const { data } = await createAdminAnnouncement({
        title: title.trim(),
        message: content.trim(),
        audience,
      });

      setAnnouncements((prev) => [data.announcement, ...prev]);
      toast.success("Announcement published successfully.");
      setTitle("");
      setContent("");
      setAudience("all");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not publish announcement."));
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Content"
        title="Platform Announcements"
        subtitle="Create and publish announcements to the platform."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="New Announcement" description="Compose a message for your selected audience." className="lg:col-span-2">
          <Card className="p-6">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter announcement title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <p className="text-xs text-[var(--muted-foreground)]">{title.trim().length}/{TITLE_MAX} characters</p>
              </div>

              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="clubs">Clubs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your announcement content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                />
                <p className="text-xs text-[var(--muted-foreground)]">{content.trim().length}/{CONTENT_MAX} characters</p>
              </div>

              <div className="flex justify-end pt-2 border-t border-[var(--border)]">
                <Button onClick={handlePublish} disabled={isPublishing}>
                  <Send className="w-4 h-4" />
                  {isPublishing ? "Publishing..." : "Publish Now"}
                </Button>
              </div>
            </div>
          </Card>
        </Section>

        <Section title="Recent Announcements" description="Latest published updates.">
          <div className="space-y-3">
            {isLoading ? (
              <Card className="p-4 text-sm text-[var(--muted-foreground)]">Loading announcements...</Card>
            ) : announcements.length === 0 ? (
              <Card className="p-4 text-sm text-[var(--muted-foreground)]">No announcements published yet.</Card>
            ) : (
              announcements.map((announcement) => (
                <Card key={announcement.id} className="p-4">
                  <div className="text-sm font-semibold mb-1">{announcement.title}</div>
                  <div className="text-xs text-[var(--muted-foreground)] mb-2">
                    Published: {new Date(announcement.createdAt).toLocaleDateString()} · Audience: {announcement.audience}
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)] line-clamp-3">{announcement.message}</div>
                </Card>
              ))
            )}
          </div>
        </Section>
      </div>
    </PageContainer>
  );
}
