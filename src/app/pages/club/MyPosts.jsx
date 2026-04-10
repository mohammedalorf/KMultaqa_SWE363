import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Link } from "react-router-dom";
import { LayoutDashboard, User, FileText, Calendar, Users, Edit, Trash2, Pin, PinOff } from "lucide-react";
import { useState } from "react";
import { mockPosts } from "../../data/mockData";
import { toast } from "sonner";

const sidebarItems = [
  { label: "Dashboard", path: "/club/dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
  { label: "Profile Settings", path: "/club/profile", icon: <User className="w-4 h-4 mr-2" /> },
  { label: "My Posts", path: "/club/posts", icon: <FileText className="w-4 h-4 mr-2" /> },
  { label: "My Events", path: "/club/events", icon: <Calendar className="w-4 h-4 mr-2" /> },
  { label: "Followers", path: "/club/followers", icon: <Users className="w-4 h-4 mr-2" /> }
];

export default function MyPosts() {
  const [posts, setPosts] = useState(mockPosts.filter((p) => String(p.clubId) === "1"));
  const [postToDelete, setPostToDelete] = useState(null);

  const handleTogglePin = (postId) => {
    setPosts(posts.map((p) => (String(p.id) === String(postId) ? { ...p, isPinned: !p.isPinned } : p)));
    toast.success("Post pin status updated");
  };

  const confirmDelete = () => {
    if (!postToDelete) return;
    setPosts(posts.filter((p) => String(p.id) !== String(postToDelete.id)));
    toast.success("Post deleted");
    setPostToDelete(null);
  };

  return (
    <DashboardLayout role="club" userName="IEEE KFUPM Student Branch" userLogo="🏫" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Posts</h1>
            <p className="text-muted-foreground">Manage your club's posts and announcements</p>
          </div>
          <Link to="/club/posts/new">
            <Button>Create New Post</Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{post.title}</h3>
                    {post.isPinned && (
                      <Badge variant="default">
                        <Pin className="w-3 h-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                    <Badge variant="outline">{post.type}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Posted: {new Date(post.createdAt).toLocaleDateString()}</span>
                    {post.updatedAt && <span>Updated: {new Date(post.updatedAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link to={`/club/posts/edit/${post.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => handleTogglePin(post.id)}>
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
                  <Button variant="destructive" size="sm" onClick={() => setPostToDelete(post)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {posts.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-4">Start sharing updates and announcements with your followers</p>
            <Link to="/club/posts/new">
              <Button>Create Your First Post</Button>
            </Link>
          </Card>
        )}
      </div>

      <Dialog open={Boolean(postToDelete)} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete "{postToDelete?.title}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPostToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
