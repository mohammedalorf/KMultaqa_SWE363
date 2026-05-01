import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { getApiErrorMessage } from "../../api/apiClient";
import { getClubPost, updateClubPost } from "../../api/clubApi";
import { ImageUploadField, contentImageAspectRatioOptions } from "../../components/ImageUploadField";

export default function EditPost() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pinPost, setPinPost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPost() {
      setIsLoading(true);

      try {
        const { data } = await getClubPost(id);

        if (!isMounted) return;

        setTitle(data.post?.title ?? "");
        setContent(data.post?.content ?? "");
        setImageUrl(data.post?.imageUrl ?? "");
        setPinPost(Boolean(data.post?.isPinned));
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not load post."));
        navigate("/club/posts");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPost();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    setIsSaving(true);

    try {
      await updateClubPost(id, {
        title,
        content,
        imageUrl,
        isPinned: pinPost,
      });
      toast.success("Post updated successfully.");
      navigate("/club/posts");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update post."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Content"
        title="Edit Post"
        subtitle="Update your post content and settings."
      />

      <Section title="Post Details" description="Modify the post content and pin setting.">
        <Card className="p-6">
          {isLoading ? (
            <div className="text-sm text-[var(--muted-foreground)]">Loading post...</div>
          ) : (
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
                <ImageUploadField
                  id="postImage"
                  label="Post Image (optional)"
                  value={imageUrl}
                  onChange={setImageUrl}
                  folder="posts"
                  disabled={isSaving}
                  aspectRatio={16 / 9}
                  aspectRatioOptions={contentImageAspectRatioOptions}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[var(--accent)] rounded-lg">
                <div>
                  <Label htmlFor="pinPost">Pin this post to club page</Label>
                  <p className="text-sm text-[var(--muted-foreground)]">Pinned posts appear at the top of your club page</p>
                </div>
                <Switch id="pinPost" checked={pinPost} onCheckedChange={setPinPost} />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdate} disabled={isSaving}>
                  {isSaving ? "Updating..." : "Update Post"}
                </Button>
                <Button variant="outline" onClick={() => navigate("/club/posts")} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      </Section>
    </PageContainer>
  );
}
