import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { LayoutDashboard, User, FileText, Calendar, Users, Upload, } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const sidebarItems = [
    { label: "Dashboard", path: "/club/dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2"/> },
    { label: "Profile Settings", path: "/club/profile", icon: <User className="w-4 h-4 mr-2"/> },
    { label: "My Posts", path: "/club/posts", icon: <FileText className="w-4 h-4 mr-2"/> },
    { label: "My Events", path: "/club/events", icon: <Calendar className="w-4 h-4 mr-2"/> },
    { label: "Followers", path: "/club/followers", icon: <Users className="w-4 h-4 mr-2"/> },
];

export default function ClubProfile() {
    const [clubName, setClubName] = useState("IEEE KFUPM Student Branch");
    const [category, setCategory] = useState("Engineering");
    const [bio, setBio] = useState("The Institute of Electrical and Electronics Engineers student branch at KFUPM. We organize technical workshops, competitions, and networking events.");
    const [contact, setContact] = useState("ieee@kfupm.edu.sa");

    const handleSave = () => {
        toast.success("Profile updated successfully!");
    };

    return (<DashboardLayout role="club" userName="IEEE KFUPM Student Branch" userLogo="🔧" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your club's public profile information
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Label>Club Logo</Label>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-4xl">
                  🔧
                </div>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2"/>
                  Upload New Logo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Recommended: Square image, at least 400x400px
              </p>
            </div>

            <div>
              <Label htmlFor="clubName">Club Name</Label>
              <Input id="clubName" value={clubName} onChange={(e) => setClubName(e.target.value)}/>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Arts & Media">Arts & Media</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Recreation">Recreation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bio">Club Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={5}/>
              <p className="text-sm text-muted-foreground mt-1">
                {bio.length} / 500 characters
              </p>
            </div>

            <div>
              <Label htmlFor="contact">Contact Email</Label>
              <Input id="contact" type="email" value={contact} onChange={(e) => setContact(e.target.value)}/>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave}>Save Changes</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>);
}