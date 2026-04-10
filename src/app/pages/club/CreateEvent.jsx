import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { LayoutDashboard, User, FileText, Calendar, Users, Plus, X, } from "lucide-react";
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

export default function CreateEvent() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [enableRegistration, setEnableRegistration] = useState(false);
    const [formFields, setFormFields] = useState([
        { id: "1", name: "Full Name", type: "text", required: true },
        { id: "2", name: "Email", type: "email", required: true },
    ]);

    const addFormField = () => {
        setFormFields([
            ...formFields,
            { id: Date.now().toString(), name: "", type: "text", required: false },
        ]);
    };

    const removeFormField = (id) => {
        setFormFields(formFields.filter((f) => f.id !== id));
    };

    const handlePublish = () => {
        if (title.trim() && date && time && location.trim()) {
            toast.success("Event created successfully!");
            navigate("/club/events");
        }
    };

    return (<DashboardLayout role="club" userName="IEEE KFUPM Student Branch" userLogo="🔧" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
          <p className="text-muted-foreground">
            Organize events and collect registrations from students
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" placeholder="Enter event title..." value={title} onChange={(e) => setTitle(e.target.value)}/>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe your event..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4}/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)}/>
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)}/>
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., Engineering Lab 205" value={location} onChange={(e) => setLocation(e.target.value)}/>
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label htmlFor="enableReg">Enable Registration Form</Label>
                  <p className="text-sm text-muted-foreground">
                    Collect student registrations for this event
                  </p>
                </div>
                <Switch id="enableReg" checked={enableRegistration} onCheckedChange={setEnableRegistration}/>
              </div>

              {enableRegistration && (<div className="space-y-4 mt-4 p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Registration Form Fields</h3>
                    <Button variant="outline" size="sm" onClick={addFormField}>
                      <Plus className="w-4 h-4 mr-1"/>
                      Add Field
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formFields.map((field) => (<div key={field.id} className="flex items-center gap-2 p-3 bg-card rounded-lg">
                        <Input placeholder="Field name" value={field.name} onChange={(e) => {
                    setFormFields(formFields.map((f) => f.id === field.id ? { ...f, name: e.target.value } : f));
                }}/>
                        <select value={field.type} onChange={(e) => {
                    setFormFields(formFields.map((f) => f.id === field.id ? { ...f, type: e.target.value } : f));
                }} className="px-3 py-2 border rounded-md">
                          <option key="text" value="text">Text</option>
                          <option key="email" value="email">Email</option>
                          <option key="number" value="number">Number</option>
                          <option key="textarea" value="textarea">Textarea</option>
                        </select>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={field.required} onChange={(e) => {
                    setFormFields(formFields.map((f) => f.id === field.id ? { ...f, required: e.target.checked } : f));
                }}/>
                          <span className="text-sm">Required</span>
                        </div>
                        {formFields.length > 2 && (<Button variant="ghost" size="icon" onClick={() => removeFormField(field.id)}>
                            <X className="w-4 h-4"/>
                          </Button>)}
                      </div>))}
                  </div>
                </div>)}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handlePublish}>Publish Event</Button>
              <Button variant="outline" onClick={() => navigate("/club/events")}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>);
}