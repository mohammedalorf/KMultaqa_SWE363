import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { LayoutDashboard, User, FileText, Calendar, Users, Plus, X, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const sidebarItems = [
  { label: "Dashboard", path: "/club/dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
  { label: "Profile Settings", path: "/club/profile", icon: <User className="w-4 h-4 mr-2" /> },
  { label: "My Posts", path: "/club/posts", icon: <FileText className="w-4 h-4 mr-2" /> },
  { label: "My Events", path: "/club/events", icon: <Calendar className="w-4 h-4 mr-2" /> },
  { label: "Followers", path: "/club/followers", icon: <Users className="w-4 h-4 mr-2" /> }
];

const MAX_MEDIA_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "application/pdf"];

export default function CreateEvent() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [locationMode, setLocationMode] = useState("onsite");
  const [location, setLocation] = useState("");
  const [enableRegistration, setEnableRegistration] = useState(false);
  const [formFields, setFormFields] = useState([
    { id: "1", name: "Full Name", type: "text", required: true },
    { id: "2", name: "KFUPM Email", type: "email", required: true }
  ]);
  const [eventMedia, setEventMedia] = useState([]);

  const addFormField = () => {
    setFormFields([...formFields, { id: Date.now().toString(), name: "", type: "text", required: false }]);
  };

  const removeFormField = (id) => {
    setFormFields(formFields.filter((f) => f.id !== id));
  };

  const handleMediaSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Invalid media type. Allowed: PNG, JPG, GIF, PDF.");
      return;
    }

    if (file.size > MAX_MEDIA_SIZE) {
      toast.error("Media exceeds 10MB size limit.");
      return;
    }

    setEventMedia((prev) => [...prev, { name: file.name, type: file.type, size: file.size }]);
    toast.success("Event media uploaded.");
  };

  const validateRegistrationFields = () => {
    if (!enableRegistration) return true;

    for (const field of formFields) {
      if (!field.name.trim()) {
        toast.error("All registration fields must have a name.");
        return false;
      }
    }

    return true;
  };

  const handlePublish = () => {
    if (!title.trim() || !date || !time) {
      toast.error("Title, date, and time are required.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);

    if (selectedDate < today) {
      toast.error("Event date cannot be in the past.");
      return;
    }

    const finalLocation = locationMode === "online" ? "Online" : location.trim();
    if (!finalLocation) {
      toast.error("Location is required (or select Online).");
      return;
    }

    if (!validateRegistrationFields()) return;

    const followers = 180;
    const sent = Math.floor(followers * 0.91);
    const failed = followers - sent;

    toast.success(`Event published. Notifications sent: ${sent}, failed: ${failed}.`);
    navigate("/club/events");
  };

  return (
    <DashboardLayout role="club" userName="IEEE KFUPM Student Branch" userLogo="🏫" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
          <p className="text-muted-foreground">Organize events and collect registrations from students</p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" placeholder="Enter event title..." value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe your event..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="locationMode">Location Type</Label>
                <Select value={locationMode} onValueChange={setLocationMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onsite">On-campus</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder={locationMode === "online" ? "Online" : "e.g., Engineering Lab 205"}
                  value={locationMode === "online" ? "Online" : location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={locationMode === "online"}
                />
              </div>
            </div>

            <div>
              <Label>Upload Event Media (Optional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.gif,.pdf"
                className="hidden"
                onChange={handleMediaSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-accent/50 transition-colors"
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">Click to upload event media</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF, PDF up to 10MB</p>
              </button>
              {eventMedia.length > 0 && (
                <div className="mt-2 space-y-1">
                  {eventMedia.map((media, index) => (
                    <div key={`${media.name}-${index}`} className="text-xs text-muted-foreground">
                      {media.name} ({Math.round(media.size / 1024)} KB)
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label htmlFor="enableReg">Enable Registration Form</Label>
                  <p className="text-sm text-muted-foreground">Collect student registrations for this event</p>
                </div>
                <Switch id="enableReg" checked={enableRegistration} onCheckedChange={setEnableRegistration} />
              </div>

              {enableRegistration && (
                <div className="space-y-4 mt-4 p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Registration Form Fields</h3>
                    <Button variant="outline" size="sm" onClick={addFormField}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Field
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formFields.map((field) => (
                      <div key={field.id} className="flex items-center gap-2 p-3 bg-card rounded-lg">
                        <Input
                          placeholder="Field name"
                          value={field.name}
                          onChange={(e) => setFormFields(formFields.map((f) => (f.id === field.id ? { ...f, name: e.target.value } : f)))}
                        />
                        <select
                          value={field.type}
                          onChange={(e) => setFormFields(formFields.map((f) => (f.id === field.id ? { ...f, type: e.target.value } : f)))}
                          className="px-3 py-2 border rounded-md"
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="number">Number</option>
                          <option value="textarea">Textarea</option>
                        </select>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => setFormFields(formFields.map((f) => (f.id === field.id ? { ...f, required: e.target.checked } : f)))}
                          />
                          <span className="text-sm">Required</span>
                        </div>
                        {formFields.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removeFormField(field.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handlePublish}>Publish Event</Button>
              <Button variant="outline" onClick={() => navigate("/club/events")}>Cancel</Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
