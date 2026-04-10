import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { LayoutDashboard, User, FileText, Calendar, Users, Upload, } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const sidebarItems = [
    { label: "Dashboard", path: "/club/dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2"/> },
    { label: "Profile Settings", path: "/club/profile", icon: <User className="w-4 h-4 mr-2"/> },
    { label: "My Posts", path: "/club/posts", icon: <FileText className="w-4 h-4 mr-2"/> },
    { label: "My Events", path: "/club/events", icon: <Calendar className="w-4 h-4 mr-2"/> },
    { label: "Followers", path: "/club/followers", icon: <Users className="w-4 h-4 mr-2"/> },
];

export default function CreatePost() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [postType, setPostType] = useState("announcement");
    const [pinPost, setPinPost] = useState(false);

    const handlePublish = () => {
        if (title.trim() && content.trim()) {
            toast.success("Post published successfully!");
            navigate("/club/posts");
        }
    };

    return (<DashboardLayout role="club" userName="IEEE KFUPM Student Branch" userLogo="🔧" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create New Post</h1>
          <p className="text-muted-foreground">
            Share announcements and updates with your followers
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Post Title</Label>
              <Input id="title" placeholder="Enter post title..." value={title} onChange={(e) => setTitle(e.target.value)}/>
            </div>

            <div>
              <Label htmlFor="postType">Post Type</Label>
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" placeholder="Write your post content..." value={content} onChange={(e) => setContent(e.target.value)} rows={10}/>
            </div>

            <div>
              <Label>Upload Media (Optional)</Label>
              <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-accent/50 cursor-pointer transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground"/>
                <p className="text-sm text-muted-foreground mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
              <div>
                <Label htmlFor="pinPost">Pin this post to club page</Label>
                <p className="text-sm text-muted-foreground">
                  Pinned posts appear at the top of your club page
                </p>
              </div>
              <Switch id="pinPost" checked={pinPost} onCheckedChange={setPinPost}/>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handlePublish}>Publish Post</Button>
              <Button variant="outline" onClick={() => navigate("/club/posts")}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>);
}