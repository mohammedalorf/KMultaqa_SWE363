import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, CheckCircle2, Clock, MapPin, Users } from "lucide-react";
import { toast } from "sonner";

import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { EmptyState } from "../../components/layout/EmptyState";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { getApiErrorMessage } from "../../api/apiClient";
import { getStudentEvent, registerForStudentEvent } from "../../api/studentApi";

function ClubAvatar({ logoUrl, name }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="w-16 h-16 rounded-full object-cover shrink-0 border border-[var(--border)] bg-[var(--accent)]"
      />
    );
  }

  return (
    <div className="w-16 h-16 bg-[var(--primary-soft)] text-[var(--primary)] rounded-full flex items-center justify-center text-2xl font-semibold shrink-0 border border-[var(--primary)]/20">
      {name?.charAt(0)?.toUpperCase() || "C"}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Date TBA";
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatTimeRange(start, end) {
  if (!start) return "Time TBA";

  const startText = new Date(start).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const endText = end
    ? new Date(end).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return endText ? `${startText} - ${endText}` : startText;
}

function getFieldInputType(fieldType) {
  if (fieldType === "number") return "number";
  if (fieldType === "email") return "email";
  return "text";
}

export default function EventRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const loadEvent = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const { data } = await getStudentEvent(id);
      setEvent(data.event);
    } catch (error) {
      setLoadError(getApiErrorMessage(error, "Could not load event."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const registrationFields = event?.registrationFields ?? [];
  const registrationClosed = useMemo(() => {
    if (!event?.endDateTime) return false;
    return new Date(event.endDateTime).getTime() <= Date.now();
  }, [event]);

  const validateForm = () => {
    const nextErrors = {};

    for (const field of registrationFields) {
      const value = formData[field.label];

      if (field.required && !String(value ?? "").trim()) {
        nextErrors[field.label] = `${field.label} is required.`;
        continue;
      }

      if (
        field.fieldType === "email" &&
        value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))
      ) {
        nextErrors[field.label] = `${field.label} must be a valid email address.`;
      }
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (event?.isRegistered) {
      toast.error("You are already registered for this event.");
      return;
    }

    if (registrationClosed) {
      toast.error("Registration is closed for this event.");
      return;
    }

    if (!validateForm()) {
      toast.error("Fix the highlighted fields before submitting.");
      return;
    }

    const answers = registrationFields
      .map((field) => ({
        fieldLabel: field.label,
        answer: String(formData[field.label] ?? "").trim(),
      }))
      .filter((answer) => answer.answer);

    setIsSubmitting(true);

    try {
      const { data } = await registerForStudentEvent(event.id, answers);
      toast.success(data.message || "Registration successful!");
      setShowConfirmation(true);

      setTimeout(() => {
        navigate("/student/my-events");
      }, 1200);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Registration failed."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer size="narrow">
        <Card className="p-8 text-center text-sm text-[var(--muted-foreground)]">
          Loading event...
        </Card>
      </PageContainer>
    );
  }

  if (loadError || !event) {
    return (
      <PageContainer size="narrow">
        <EmptyState
          title="Event not found"
          description={loadError || "The event you tried to open is no longer available."}
          action={<Button onClick={() => navigate("/student/dashboard")}>Back to Dashboard</Button>}
        />
      </PageContainer>
    );
  }

  if (showConfirmation) {
    return (
      <PageContainer size="narrow">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-12 text-center max-w-md">
            <div className="w-16 h-16 bg-[var(--success-soft)] text-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Registration Confirmed!</h2>
            <p className="text-[var(--muted-foreground)] mb-6">You're successfully registered for {event.title}</p>
            <Button onClick={() => navigate("/student/my-events")} className="w-full">View My Events</Button>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="narrow">
      <PageHeader
        eyebrow="Events"
        title={event.title}
        subtitle={event.description || "Event details and registration information."}
      />

      <Section>
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <ClubAvatar logoUrl={event.club?.logoUrl || event.clubLogoUrl} name={event.clubName} />
            <div className="flex-1">
              <div className="text-sm text-[var(--muted-foreground)] mb-3">{event.clubName}</div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span>{formatDate(event.startDateTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span>{formatTimeRange(event.startDateTime, event.endDateTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span>{event.location || "Location TBA"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span>
                    {event.capacity
                      ? `${event.registered} / ${event.capacity} registered`
                      : `${event.registered} registered`}
                  </span>
                </div>
              </div>
              {registrationClosed && (
                <p className="text-sm text-[var(--destructive)] mt-3">Registration closed: event has ended.</p>
              )}
            </div>
          </div>
        </Card>
      </Section>

      <Section title="Registration Form">
        <Card className="p-6">
          {event.isRegistered ? (
            <EmptyState
              title="Already registered"
              description="You are already registered for this event."
              action={<Button onClick={() => navigate("/student/my-events")}>View My Events</Button>}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {registrationFields.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">
                  This event does not require extra registration details.
                </p>
              )}

              {registrationFields.map((field, index) => {
                const fieldId = `registration-field-${index}`;
                const value = formData[field.label] ?? "";
                const error = formErrors[field.label];

                return (
                  <div key={field.label} className="space-y-1.5">
                    <Label htmlFor={fieldId}>
                      {field.label}
                      {field.required && <span className="text-[var(--destructive)] ml-1">*</span>}
                    </Label>
                    {field.fieldType === "select" ? (
                      <Select
                        value={value}
                        onValueChange={(nextValue) => {
                          setFormData({ ...formData, [field.label]: nextValue });
                          setFormErrors({ ...formErrors, [field.label]: undefined });
                        }}
                      >
                        <SelectTrigger id={fieldId}>
                          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {(field.options ?? []).map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.fieldType === "checkbox" ? (
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          id={fieldId}
                          type="checkbox"
                          checked={value === "true"}
                          onChange={(e) => {
                            setFormData({ ...formData, [field.label]: e.target.checked ? "true" : "" });
                            setFormErrors({ ...formErrors, [field.label]: undefined });
                          }}
                        />
                        <span>{field.label}</span>
                      </label>
                    ) : (
                      <Input
                        id={fieldId}
                        type={getFieldInputType(field.fieldType)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        value={value}
                        onChange={(e) => {
                          setFormData({ ...formData, [field.label]: e.target.value });
                          setFormErrors({ ...formErrors, [field.label]: undefined });
                        }}
                        className={error ? "border-[var(--destructive)]" : ""}
                      />
                    )}
                    {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}
                  </div>
                );
              })}

              <div className="pt-4">
                <Button type="submit" className="w-full" size="lg" disabled={registrationClosed || isSubmitting}>
                  {isSubmitting ? "Registering..." : "Complete Registration"}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </Section>
    </PageContainer>
  );
}
