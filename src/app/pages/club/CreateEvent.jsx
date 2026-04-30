import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createClubEvent } from "../../api/clubApi";
import { getApiErrorMessage } from "../../api/apiClient";

const categories = [
  { value: "academic", label: "Academic" },
  { value: "technical", label: "Technical" },
  { value: "sports", label: "Sports" },
  { value: "volunteering", label: "Volunteering" },
  { value: "cultural", label: "Cultural" },
  { value: "social", label: "Social" },
  { value: "other", label: "Other" },
];

export default function CreateEvent() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [locationMode, setLocationMode] = useState("onsite");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [enableRegistration, setEnableRegistration] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [formFields, setFormFields] = useState([
    { id: "1", name: "Full Name", type: "text", required: true },
    { id: "2", name: "KFUPM Email", type: "email", required: true }
  ]);

  const addFormField = () => {
    setFormFields([...formFields, { id: Date.now().toString(), name: "", type: "text", required: false }]);
  };

  const removeFormField = (id) => {
    setFormFields(formFields.filter((f) => f.id !== id));
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

  const handlePublish = async () => {
    if (!title.trim() || !description.trim() || !date || !time || !endTime) {
      toast.error("Title, description, start time, and end time are required.");
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

    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time.");
      return;
    }

    const registrationFields = enableRegistration
      ? formFields.map((field) => ({
          label: field.name,
          fieldType: field.type,
          required: field.required,
          options: [],
        }))
      : [];

    setIsPublishing(true);

    try {
      await createClubEvent({
        title,
        description,
        category,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        location: finalLocation,
        capacity,
        imageUrl,
        registrationFields,
      });

      toast.success("Event published. Followers will see a notification.");
      navigate("/club/events");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not publish event."));
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Events"
        title="Create New Event"
        subtitle="Organize events and collect registrations from students."
      />

      <Section title="Event Details" description="Fill in the basics and add a registration form if needed.">
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

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
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

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacity (optional)</Label>
                <Input id="capacity" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label htmlFor="enableReg">Enable Registration Form</Label>
                  <p className="text-sm text-[var(--muted-foreground)]">Collect student registrations for this event</p>
                </div>
                <Switch id="enableReg" checked={enableRegistration} onCheckedChange={setEnableRegistration} />
              </div>

              {enableRegistration && (
                <div className="space-y-4 mt-4 p-4 bg-[var(--accent)]/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Registration Form Fields</h3>
                    <Button variant="outline" size="sm" onClick={addFormField}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Field
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formFields.map((field) => (
                      <div key={field.id} className="flex items-center gap-2 p-3 bg-[var(--card)] rounded-lg">
                        <Input
                          placeholder="Field name"
                          value={field.name}
                          onChange={(e) => setFormFields(formFields.map((f) => (f.id === field.id ? { ...f, name: e.target.value } : f)))}
                        />
                        <select
                          value={field.type}
                          onChange={(e) => setFormFields(formFields.map((f) => (f.id === field.id ? { ...f, type: e.target.value } : f)))}
                          className="px-3 py-2 border border-[var(--border)] rounded-md"
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="number">Number</option>
                          <option value="checkbox">Checkbox</option>
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
              <Button onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? "Publishing..." : "Publish Event"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/club/events")}>Cancel</Button>
            </div>
          </div>
        </Card>
      </Section>
    </PageContainer>
  );
}
