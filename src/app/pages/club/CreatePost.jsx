import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createClubPost } from "../../api/clubApi";
import { getApiErrorMessage } from "../../api/apiClient";

export default function CreatePost() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinPost, setPinPost] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    setIsPublishing(true);

    try {
      await createClubPost({
        title,
        content,
        imageUrl,
        isPinned: pinPost,
      });

      toast.success("Post published. Followers will see a notification.");
      navigate("/club/posts");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not publish post."));
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Content"
        title="Create New Post"
        subtitle="Share announcements and updates with your followers."
      />

      <Section title="Post Details" description="Compose your announcement and set options before publishing.">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Post Title</Label>
              <Input id="title" placeholder="Enter post title..." value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" placeholder="Write your post content..." value={content} onChange={(e) => setContent(e.target.value)} rows={10} />
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>

            <div className="flex items-center justify-between p-4 bg-[var(--accent)] rounded-lg">
              <div>
                <Label htmlFor="pinPost">Pin this post to club page</Label>
                <p className="text-sm text-[var(--muted-foreground)]">Pinned posts appear at the top of your club page</p>
              </div>
              <Switch id="pinPost" checked={pinPost} onCheckedChange={setPinPost} />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? "Publishing..." : "Publish Post"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/club/posts")}>Cancel</Button>
            </div>
          </div>
        </Card>
      </Section>
    </PageContainer>
  );
}
