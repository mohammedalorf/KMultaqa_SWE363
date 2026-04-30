import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Edit, FileText, Pin, PinOff, Trash2 } from "lucide-react";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { EmptyState } from "../../components/layout/EmptyState";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { getApiErrorMessage } from "../../api/apiClient";
import { deleteClubPost, getClubPosts, updateClubPost } from "../../api/clubApi";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyPostId, setBusyPostId] = useState(null);

  const loadPosts = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const { data } = await getClubPosts();
      setPosts(data.posts ?? []);
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not load posts.");
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleTogglePin = async (post) => {
    setBusyPostId(post.id);

    try {
      const { data } = await updateClubPost(post.id, { isPinned: !post.isPinned });
      setPosts((current) =>
        current
          .map((item) => (item.id === post.id ? data.post : item))
          .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || new Date(b.createdAt) - new Date(a.createdAt))
      );
      toast.success("Post pin status updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update post."));
    } finally {
      setBusyPostId(null);
    }
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    setBusyPostId(postToDelete.id);

    try {
      await deleteClubPost(postToDelete.id);
      setPosts((current) => current.filter((post) => post.id !== postToDelete.id));
      toast.success("Post deleted");
      setPostToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete post."));
    } finally {
      setBusyPostId(null);
    }
  };

  return (
    <>
      <PageContainer>
        <PageHeader
          eyebrow="Content"
          title="My Posts"
          subtitle="Manage your club's posts and announcements."
          actions={
            <Link to="/club/posts/new">
              <Button>Create New Post</Button>
            </Link>
          }
        />

        <Section title="All Posts" description="Your published posts and announcements.">
          {isLoading ? (
            <Card className="p-8 text-center text-sm text-[var(--muted-foreground)]">
              Loading posts...
            </Card>
          ) : loadError ? (
            <EmptyState
              icon={<FileText className="w-6 h-6" />}
              title="Could not load posts"
              description={loadError}
              action={<Button onClick={loadPosts}>Try Again</Button>}
            />
          ) : posts.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-6 h-6" />}
              title="No posts yet"
              description="Start sharing updates and announcements with your followers."
              action={
                <Link to="/club/posts/new">
                  <Button>Create Your First Post</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4">
              {posts.map((post) => (
                <Card key={post.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold">{post.title}</h3>
                        {post.isPinned && (
                          <Badge variant="default">
                            <Pin className="w-3 h-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                      </div>
                      <p className="text-[var(--muted-foreground)] mb-3">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)] flex-wrap">
                        <span>
                          Posted:{" "}
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Link to={`/club/posts/edit/${post.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePin(post)}
                        disabled={busyPostId === post.id}
                      >
                        {post.isPinned ? (
                          <>
                            <PinOff className="w-4 h-4 mr-1" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="w-4 h-4 mr-1" />
                            Pin
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setPostToDelete(post)}
                        disabled={busyPostId === post.id}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>
      </PageContainer>

      <Dialog open={Boolean(postToDelete)} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--muted-foreground)]">
            Delete "{postToDelete?.title}"? Students will no longer see it.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPostToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={busyPostId === postToDelete?.id}>
              Delete Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
