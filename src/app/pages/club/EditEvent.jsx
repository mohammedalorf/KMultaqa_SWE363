import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
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
import { getApiErrorMessage } from "../../api/apiClient";
import { getClubEvent, updateClubEvent } from "../../api/clubApi";
import { ImageUploadField, contentImageAspectRatioOptions } from "../../components/ImageUploadField";

const categories = [
  { value: "academic", label: "Academic" },
  { value: "technical", label: "Technical" },
  { value: "sports", label: "Sports" },
  { value: "volunteering", label: "Volunteering" },
  { value: "cultural", label: "Cultural" },
  { value: "social", label: "Social" },
  { value: "other", label: "Other" },
];
const optionFieldTypes = new Set(["checkbox", "radio"]);

function buildEventDateTime(dateValue, timeValue, fallbackTime) {
  return new Date(`${dateValue}T${timeValue ? `${timeValue}:00` : fallbackTime}`);
}

function toInputDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function toInputTime(value) {
  if (!value) return "";
  return new Date(value).toTimeString().slice(0, 5);
}

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

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
  const [requiresRegistrationApproval, setRequiresRegistrationApproval] = useState(false);
  const [formFields, setFormFields] = useState([
    { id: "1", name: "Full Name", type: "text", required: true, options: [] },
    { id: "2", name: "KFUPM Email", type: "email", required: true, options: [] },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadEvent() {
      setIsLoading(true);

      try {
        const { data } = await getClubEvent(id);
        const event = data.event;

        if (!isMounted) return;

        setTitle(event?.title ?? "");
        setDescription(event?.description ?? "");
        setCategory(event?.category ?? "other");
        setDate(toInputDate(event?.startDateTime));
        setTime(event?.hasStartTime === false ? "" : toInputTime(event?.startDateTime));
        setEndTime(event?.hasEndTime === false ? "" : toInputTime(event?.endDateTime));
        setCapacity(event?.capacity ? String(event.capacity) : "");
        setImageUrl(event?.imageUrl ?? "");
        setRequiresRegistrationApproval(Boolean(event?.requiresRegistrationApproval));

        if ((event?.location || "").toLowerCase() === "online") {
          setLocationMode("online");
          setLocation("");
        } else {
          setLocationMode("onsite");
          setLocation(event?.location ?? "");
        }

        const registrationFields = event?.registrationFields ?? [];
        setEnableRegistration(registrationFields.length > 0);

        if (registrationFields.length > 0) {
          setFormFields(
            registrationFields.map((field, index) => ({
              id: `${index + 1}`,
              name: field.label,
              type: field.fieldType,
              required: Boolean(field.required),
              options: optionFieldTypes.has(field.fieldType) ? (field.options?.length ? field.options : [""]) : [],
            }))
          );
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not load event."));
        navigate("/club/events");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const addFormField = () => {
    setFormFields([...formFields, { id: Date.now().toString(), name: "", type: "text", required: false, options: [] }]);
  };

  const removeFormField = (fieldId) => {
    setFormFields(formFields.filter((field) => field.id !== fieldId));
  };

  const updateFormField = (fieldId, updates) => {
    setFormFields(formFields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)));
  };

  const updateFieldType = (fieldId, type) => {
    setFormFields(
      formFields.map((field) => {
        if (field.id !== fieldId) return field;

        return {
          ...field,
          type,
          options: optionFieldTypes.has(type) ? (field.options?.length ? field.options : [""]) : [],
        };
      })
    );
  };

  const updateFieldOption = (fieldId, optionIndex, value) => {
    setFormFields(
      formFields.map((field) => {
        if (field.id !== fieldId) return field;

        const options = [...(field.options ?? [])];
        options[optionIndex] = value;
        return { ...field, options };
      })
    );
  };

  const addFieldOption = (fieldId) => {
    setFormFields(
      formFields.map((field) =>
        field.id === fieldId ? { ...field, options: [...(field.options ?? []), ""] } : field
      )
    );
  };

  const removeFieldOption = (fieldId, optionIndex) => {
    setFormFields(
      formFields.map((field) => {
        if (field.id !== fieldId) return field;

        const nextOptions = (field.options ?? []).filter((_, index) => index !== optionIndex);
        return { ...field, options: nextOptions.length ? nextOptions : [""] };
      })
    );
  };

  const getCleanFieldOptions = (field) => {
    return (field.options ?? []).map((option) => option.trim()).filter(Boolean);
  };

  const validateRegistrationFields = () => {
    if (!enableRegistration) return true;

    for (const field of formFields) {
      if (!field.name.trim()) {
        toast.error("All registration fields must have a name.");
        return false;
      }

      if (optionFieldTypes.has(field.type) && getCleanFieldOptions(field).length === 0) {
        toast.error(`Add at least one option for "${field.name}".`);
        return false;
      }
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!title.trim() || !description.trim() || !date) {
      toast.error("Title, description, and date are required.");
      return;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    const startDateTime = buildEventDateTime(date, time, "00:00:00");
    const endDateTime = buildEventDateTime(date, endTime, "23:59:59");

    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time.");
      return;
    }

    const registrationFields = enableRegistration
      ? formFields.map((field) => ({
          label: field.name,
          fieldType: field.type,
          required: field.required,
          options: optionFieldTypes.has(field.type) ? getCleanFieldOptions(field) : [],
        }))
      : [];

    setIsSaving(true);

    try {
      await updateClubEvent(id, {
        title,
        description,
        category,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        hasStartTime: Boolean(time),
        hasEndTime: Boolean(endTime),
        location: finalLocation,
        capacity,
        imageUrl,
        registrationFields,
        requiresRegistrationApproval,
      });
      toast.success("Event updated successfully.");
      navigate("/club/events");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update event."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Events"
        title="Edit Event"
        subtitle="Update your event details and registration form."
      />

      <Section title="Event Details" description="Revise event info and registration settings.">
        <Card className="p-6">
          {isLoading ? (
            <div className="text-sm text-[var(--muted-foreground)]">Loading event...</div>
          ) : (
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
                  <Label htmlFor="time">Start Time (optional)</Label>
                  <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time (optional)</Label>
                  <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                  <ImageUploadField
                    id="eventImage"
                    label="Event Image (optional)"
                    value={imageUrl}
                    onChange={setImageUrl}
                    folder="events"
                    disabled={isSaving}
                    aspectRatio={16 / 9}
                    aspectRatioOptions={contentImageAspectRatioOptions}
                  />
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label htmlFor="approvalRequired">Require Registration Approval</Label>
                    <p className="text-sm text-[var(--muted-foreground)]">Review each student's answers before confirming their seat.</p>
                  </div>
                  <Switch id="approvalRequired" checked={requiresRegistrationApproval} onCheckedChange={setRequiresRegistrationApproval} />
                </div>

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
                        <div key={field.id} className="space-y-3 p-3 bg-[var(--card)] rounded-lg border border-[var(--border)]">
                          <div className="grid gap-2 lg:grid-cols-[1fr_160px_auto_auto] lg:items-center">
                            <Input
                              placeholder="Field name"
                              value={field.name}
                              onChange={(e) => updateFormField(field.id, { name: e.target.value })}
                            />
                            <select
                              value={field.type}
                              onChange={(e) => updateFieldType(field.id, e.target.value)}
                              className="h-10 px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--card)] text-sm"
                            >
                              <option value="text">Text</option>
                              <option value="email">Email</option>
                              <option value="number">Number</option>
                              <option value="checkbox">Checkboxes</option>
                              <option value="radio">Radio Buttons</option>
                            </select>
                            <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateFormField(field.id, { required: e.target.checked })}
                              />
                              Required
                            </label>
                            {formFields.length > 1 && (
                              <Button variant="ghost" size="icon" onClick={() => removeFormField(field.id)} aria-label="Remove field">
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          {optionFieldTypes.has(field.type) && (
                            <div className="space-y-2 rounded-md bg-[var(--accent)]/40 p-3">
                              <div className="flex items-center justify-between gap-3">
                                <Label>{field.type === "radio" ? "Radio Options" : "Checkbox Options"}</Label>
                                <Button variant="outline" size="sm" onClick={() => addFieldOption(field.id)}>
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Option
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {(field.options?.length ? field.options : [""]).map((option, optionIndex) => (
                                  <div key={`${field.id}-option-${optionIndex}`} className="flex items-center gap-2">
                                    <Input
                                      placeholder={`Option ${optionIndex + 1}`}
                                      value={option}
                                      onChange={(e) => updateFieldOption(field.id, optionIndex, e.target.value)}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeFieldOption(field.id, optionIndex)}
                                      aria-label="Remove option"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdate} disabled={isSaving}>
                  {isSaving ? "Updating..." : "Update Event"}
                </Button>
                <Button variant="outline" onClick={() => navigate("/club/events")} disabled={isSaving}>
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
