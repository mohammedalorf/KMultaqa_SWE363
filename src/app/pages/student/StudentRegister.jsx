import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { getApiErrorMessage } from "../../api/apiClient";
import { registerStudent } from "../../api/authApi";

const STUDENT_ID_REGEX = /^s\d{9}$/i;

const FEATURES = [
  "Follow clubs and get a personalized feed",
  "Register for events with a single click",
  "Stay updated with campus announcements",
];

function getRegistrationErrors({ fullName, studentId, password, confirmPassword }) {
  const errors = {};
  const normalizedStudentId = studentId.trim().toLowerCase();

  if (!fullName.trim()) {
    errors.fullName = "Enter your full name.";
  } else if (fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  }

  if (!studentId.trim()) {
    errors.studentId = "Enter your Student ID.";
  } else if (!STUDENT_ID_REGEX.test(normalizedStudentId)) {
    errors.studentId = "Student ID must start with s followed by 9 digits, for example s123456789.";
  }

  if (!password) {
    errors.password = "Enter a password.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (password && password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match. Re-enter the same password.";
  }

  return errors;
}

function getFirstError(errors) {
  return Object.values(errors).find(Boolean);
}

function fieldClassName(error) {
  return error
    ? "border-[var(--destructive)] focus-visible:border-[var(--destructive)] focus-visible:ring-[var(--destructive)]/15"
    : "";
}

function FieldError({ id, message }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="text-xs text-[var(--destructive)]" role="alert">
      {message}
    </p>
  );
}

export default function StudentRegister() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState(null);
  const normalizedStudentId = studentId.trim().toLowerCase();
  const universityEmail = STUDENT_ID_REGEX.test(normalizedStudentId)
    ? `${normalizedStudentId}@kfupm.edu.sa`
    : "";

  const clearError = (field) => {
    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage(null);
    const normalizedStudentId = studentId.trim().toLowerCase();
    const universityEmail = `${normalizedStudentId}@kfupm.edu.sa`;
    const validationErrors = getRegistrationErrors({
      fullName,
      studentId,
      password,
      confirmPassword,
    });
    const firstError = getFirstError(validationErrors);

    if (firstError) {
      setErrors(validationErrors);
      toast.error(firstError);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const { data } = await registerStudent({
        name: fullName.trim(),
        studentId: normalizedStudentId,
        email: universityEmail,
        password,
      });

      localStorage.setItem("pendingVerificationEmail", universityEmail);
      localStorage.setItem("pendingVerificationStudentId", normalizedStudentId);
      toast.success(data.message || `Verification email sent to ${universityEmail}.`);
      navigate("/student/verify-email", {
        state: {
          studentId: normalizedStudentId,
          email: universityEmail,
        },
      });
    } catch (error) {
      const message = getApiErrorMessage(error, "Registration failed. Please try again.");
      setFormMessage({ type: "error", text: message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
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
            <div className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-4">Student Portal</div>
            <h2 className="text-[1.85rem] font-bold text-white leading-tight mb-8 tracking-tight">
              Join KFUPM's campus community
            </h2>
            <ul className="space-y-4">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/75 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-[var(--teal)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[11px] text-white/25 mt-auto">
            © {new Date().getFullYear()} King Fahd University of Petroleum & Minerals
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--background)] px-6 py-10 sm:px-10 min-w-0 overflow-y-auto">
        <div className="lg:hidden mb-8">
          <img src="/logos/logo-compact.png" alt="KMultaqa" className="h-20 w-auto object-contain mx-auto" />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight mb-1.5">Student Registration</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Create your account with KFUPM credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearError("fullName");
                }}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                className={fieldClassName(errors.fullName)}
              />
              <FieldError id="fullName-error" message={errors.fullName} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                placeholder="s123456789"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  clearError("studentId");
                }}
                aria-invalid={Boolean(errors.studentId)}
                aria-describedby={errors.studentId ? "studentId-error" : undefined}
                className={fieldClassName(errors.studentId)}
              />
              <FieldError id="studentId-error" message={errors.studentId} />
              <p className="text-xs text-[var(--muted-foreground)]" aria-live="polite">
                {universityEmail
                  ? `Verification will be sent to ${universityEmail}.`
                  : "Your university email will be created from your Student ID."}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                  clearError("confirmPassword");
                }}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={fieldClassName(errors.password)}
              />
              <FieldError id="password-error" message={errors.password} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearError("confirmPassword");
                }}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                className={fieldClassName(errors.confirmPassword)}
              />
              <FieldError id="confirmPassword-error" message={errors.confirmPassword} />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
            {formMessage && (
              <p
                className={`text-sm ${
                  formMessage.type === "error"
                    ? "text-[var(--destructive)]"
                    : "text-[var(--success)]"
                }`}
                role="status"
              >
                {formMessage.text}
              </p>
            )}
          </form>

          <div className="mt-5 text-center space-y-2">
            <Link to="/student/login" className="text-sm text-[var(--primary)] hover:underline block">
              Already have an account? Sign in
            </Link>
            <Link to="/">
              <Button variant="ghost" className="w-full text-[var(--muted-foreground)]">← Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
