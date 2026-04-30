import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { getApiErrorMessage } from "../../api/apiClient";
import { submitClubRequest } from "../../api/clubApi";

const CATEGORIES = [
  { value: "academic", label: "Academic" },
  { value: "technical", label: "Technical" },
  { value: "sports", label: "Sports" },
  { value: "volunteering", label: "Volunteering" },
  { value: "cultural", label: "Cultural" },
  { value: "social", label: "Social" },
  { value: "other", label: "Other" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_ID_REGEX = /^s\d{9}$/i;

const FEATURES = [
  "Submit your request for admin review",
  "Receive a password setup email after approval",
  "Start publishing posts and events after setup",
];

function validateForm(values) {
  const errors = {};

  if (!values.clubName.trim()) errors.clubName = "Club name is required.";
  if (!values.description.trim()) errors.description = "Description is required.";
  if (!values.category) errors.category = "Choose a club category.";
  if (!values.representativeName.trim()) errors.representativeName = "Representative name is required.";
  if (!EMAIL_REGEX.test(values.representativeEmail.trim())) {
    errors.representativeEmail = "Enter a valid representative email.";
  }
  if (!STUDENT_ID_REGEX.test(values.representativeStudentId.trim())) {
    errors.representativeStudentId = "Student ID must match format s123456789.";
  }
  if (!EMAIL_REGEX.test(values.requestedEmail.trim())) {
    errors.requestedEmail = "Enter a valid club email.";
  }

  return errors;
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--destructive)] mt-1">{message}</p>;
}

export default function ClubRegister() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    clubName: "",
    description: "",
    category: "",
    representativeName: "",
    representativeEmail: "",
    representativeStudentId: "",
    requestedEmail: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Fix the highlighted fields before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitClubRequest({
        clubName: values.clubName.trim(),
        description: values.description.trim(),
        category: values.category,
        representativeName: values.representativeName.trim(),
        representativeEmail: values.representativeEmail.trim().toLowerCase(),
        representativeStudentId: values.representativeStudentId.trim().toLowerCase(),
        requestedEmail: values.requestedEmail.trim().toLowerCase(),
      });

      toast.success("Club request submitted for admin review.");
      navigate("/club/login");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not submit club request."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex w-[420px] shrink-0 flex-col relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1E3A5F 0%, #17304E 100%)" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 15% 85%, rgba(42,157,143,0.22) 0%, transparent 50%), radial-gradient(circle at 80% 15%, rgba(59,109,160,0.25) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          <Link to="/">
            <img
              src="/logos/logo-black.png"
              alt="KMultaqa"
              className="h-20 w-auto object-contain hover:opacity-75 transition-opacity"
              style={{ filter: "invert(1)" }}
            />
          </Link>
          <div className="mt-auto mb-auto pt-16 pb-8">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-4">Club Registration</div>
            <h2 className="text-[1.85rem] font-bold text-white leading-tight mb-8 tracking-tight">
              Request a club workspace
            </h2>
            <ul className="space-y-4">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-white/75 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-[var(--teal)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--background)] px-6 py-10 sm:px-10 min-w-0">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight mb-1.5">Club Registration Request</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Submit your club details. An administrator will review the request before account setup.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="clubName">Club Name</Label>
                <Input
                  id="clubName"
                  value={values.clubName}
                  onChange={(event) => updateField("clubName", event.target.value)}
                />
                <FieldError message={errors.clubName} />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={values.category} onValueChange={(value) => updateField("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.category} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={values.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
              <FieldError message={errors.description} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="representativeName">Representative Name</Label>
                <Input
                  id="representativeName"
                  value={values.representativeName}
                  onChange={(event) => updateField("representativeName", event.target.value)}
                />
                <FieldError message={errors.representativeName} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="representativeStudentId">Representative Student ID</Label>
                <Input
                  id="representativeStudentId"
                  placeholder="s123456789"
                  value={values.representativeStudentId}
                  onChange={(event) => updateField("representativeStudentId", event.target.value)}
                />
                <FieldError message={errors.representativeStudentId} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="representativeEmail">Representative Email</Label>
                <Input
                  id="representativeEmail"
                  type="email"
                  placeholder="s123456789@kfupm.edu.sa"
                  value={values.representativeEmail}
                  onChange={(event) => updateField("representativeEmail", event.target.value)}
                />
                <FieldError message={errors.representativeEmail} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="requestedEmail">Requested Club Email</Label>
                <Input
                  id="requestedEmail"
                  type="email"
                  placeholder="club@kfupm.edu.sa"
                  value={values.requestedEmail}
                  onChange={(event) => updateField("requestedEmail", event.target.value)}
                />
                <FieldError message={errors.requestedEmail} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
              <Link to="/club/login">
                <Button type="button" variant="outline">Back to Club Login</Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
