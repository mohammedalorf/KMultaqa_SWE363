import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { LayoutDashboard, CheckSquare, Flag, Users, Megaphone, Scale, FileText, Settings, Send, } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const sidebarItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2"/> },
    { label: "Club Approvals", path: "/admin/club-approvals", icon: <CheckSquare className="w-4 h-4 mr-2"/> },
    { label: "Reports", path: "/admin/reports", icon: <Flag className="w-4 h-4 mr-2"/> },
    { label: "Club Management", path: "/admin/club-management", icon: <Users className="w-4 h-4 mr-2"/> },
    { label: "Announcements", path: "/admin/announcements", icon: <Megaphone className="w-4 h-4 mr-2"/> },
    { label: "Appeals", path: "/admin/appeals", icon: <Scale className="w-4 h-4 mr-2"/> },
    { label: "Export Reports", path: "/admin/export", icon: <FileText className="w-4 h-4 mr-2"/> },
    { label: "Settings", path: "/admin/settings", icon: <Settings className="w-4 h-4 mr-2"/> },
];

export default function Announcements() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [audience, setAudience] = useState("all");
    const [publishDate, setPublishDate] = useState("");

    const handlePublish = () => {
        if (title.trim() && content.trim()) {
            toast.success("Announcement published successfully!");
            setTitle("");
            setContent("");
            setAudience("all");
            setPublishDate("");
        }
    };

    return (
        <DashboardLayout role="admin" userName="Dr. Abdullah Al-Mutairi" sidebarItems={sidebarItems}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Platform Announcements</h1>
                    <p className="text-muted-foreground">
                        Create and publish announcements for the platform
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Create Form */}
                    <Card className="p-6 md:col-span-2">
                        <h2 className="text-xl font-semibold mb-6">Create New Announcement</h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" placeholder="Enter announcement title" value={title} onChange={(e) => setTitle(e.target.value)}/>
                            </div>

                            <div>
                                <Label htmlFor="content">Content</Label>
                                <Textarea id="content" placeholder="Write your announcement content..." value={content} onChange={(e) => setContent(e.target.value)} rows={10}/>
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
                                    <Input id="publishDate" type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)}/>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button onClick={handlePublish} className="flex-1">
                                    <Send className="w-4 h-4 mr-2"/>
                                    Publish Now
                                </Button>
                                <Button variant="outline">Preview</Button>
                            </div>
                        </div>
                    </Card>

                    {/* Recent Announcements */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Recent Announcements</h2>
                        <Card className="p-4">
                            <div className="text-sm font-semibold mb-1">
                                Welcome to Spring 2026 Semester
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                                Published: Feb 1, 2026
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Welcome back students! New clubs and events...
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm font-semibold mb-1">
                                Club Fair Next Week
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                                Published: Feb 15, 2026
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Don't miss the annual club fair on campus...
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm font-semibold mb-1">
                                Platform Maintenance Notice
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                                Published: Feb 20, 2026
                            </div>
                            <div className="text-sm text-muted-foreground">
                                The platform will undergo maintenance...
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}