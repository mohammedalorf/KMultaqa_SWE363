import { StudentLayout } from "../../components/layout/StudentLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Search, Settings, Calendar, Clock, MapPin, Users, Rss } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { mockEvents } from "../../data/mockData";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const navItems = [
  { label: "Feed", path: "/student/dashboard", icon: <Rss className="w-4 h-4" /> },
  { label: "Explore Clubs", path: "/student/explore", icon: <Search className="w-4 h-4" /> },
  { label: "My Events", path: "/student/my-events", icon: <Calendar className="w-4 h-4" /> },
  { label: "Settings", path: "/student/settings", icon: <Settings className="w-4 h-4" /> }
];

const EMAIL_REGEX = /^[^\s@]+@kfupm\.edu\.sa$/i;
const STUDENT_ID_REGEX = /^s\d{6}$/i;

export default function EventRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);

  const event = mockEvents.find((e) => String(e.id) === String(id));

  const hasRegistration = event ? event.hasRegistration ?? true : false;
  const registrationFields =
    event?.registrationFields || [
      { name: "Full Name", type: "text", required: true },
      { name: "KFUPM Email", type: "email", required: true },
      { name: "Student ID", type: "text", required: true },
      { name: "Notes", type: "textarea", required: false }
    ];

  const deadlineClosed = useMemo(() => {
    if (!event?.date) return false;
    const deadline = new Date(event.date);
    deadline.setDate(deadline.getDate() - 1);
    deadline.setHours(23, 59, 59, 999);
    return Date.now() > deadline.getTime();
  }, [event]);

  if (!event) {
    return <div>Event not found</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (registeredEventIds.includes(String(event.id))) {
      toast.error("You are already registered for this event.");
      return;
    }

    if (deadlineClosed) {
      toast.error("Registration deadline has passed for this event.");
      return;
    }

    const emailValue = formData["KFUPM Email"] || formData["Email"] || "";
    const studentIdValue = formData["Student ID"] || "";

    if (emailValue && !EMAIL_REGEX.test(emailValue)) {
      toast.error("Use a valid KFUPM email format.");
      return;
    }

    if (studentIdValue && !STUDENT_ID_REGEX.test(studentIdValue)) {
      toast.error("Student ID must match format s123456.");
      return;
    }

    setRegisteredEventIds((prev) => [...prev, String(event.id)]);
    setShowConfirmation(true);
    toast.success("Registration successful!");

    setTimeout(() => {
      navigate("/student/dashboard");
    }, 1500);
  };

  if (showConfirmation) {
    return (
      <StudentLayout userName="Ahmed Al-Qahtani" navItems={navItems}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-12 text-center max-w-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Registration Confirmed!</h2>
            <p className="text-muted-foreground mb-6">You're successfully registered for {event.title}</p>
            <Button onClick={() => navigate("/student/dashboard")} className="w-full">Back to Dashboard</Button>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout userName="Ahmed Al-Qahtani" navItems={navItems}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-3xl">{event.clubLogo}</div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">{event.clubName}</div>
              <h1 className="text-3xl font-bold mb-3">{event.title}</h1>
              <p className="text-muted-foreground mb-4">{event.description}</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{event.registrations || event.attendees || 0} registered</span>
                </div>
              </div>
              {deadlineClosed && <p className="text-sm text-red-600 mt-3">Registration closed: deadline has passed.</p>}
            </div>
          </div>
        </Card>

        {hasRegistration ? (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Registration Form</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {registrationFields.map((field, index) => (
                <div key={index}>
                  <Label htmlFor={field.name}>
                    {field.name}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      placeholder={`Enter ${field.name.toLowerCase()}`}
                      required={field.required}
                      value={formData[field.name] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type === "text" ? "text" : field.type}
                      placeholder={`Enter ${field.name.toLowerCase()}`}
                      required={field.required}
                      value={formData[field.name] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    />
                  )}
                </div>
              ))}

              <div className="pt-4">
                <Button type="submit" className="w-full" size="lg" disabled={deadlineClosed}>
                  Complete Registration
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Registration is not available for this event</p>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
