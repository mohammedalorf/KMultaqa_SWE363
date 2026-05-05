import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { getApiErrorMessage } from "../api/apiClient";
import { requestPasswordReset } from "../api/authApi";

const roleContent = {
  student: {
    title: "Reset Student Password",
    subtitle: "Enter your university email and we will send a password reset link.",
    emailLabel: "University Email",
    emailPlaceholder: "s123456789@kfupm.edu.sa",
    loginPath: "/student/login",
  },
  club: {
    title: "Reset Club Password",
    subtitle: "Enter your club email and we will send a password reset link.",
    emailLabel: "Club Email",
    emailPlaceholder: "club@kfupm.edu.sa",
    loginPath: "/club/login",
  },
  admin: {
    title: "Reset Admin Password",
    subtitle: "Enter your admin email and we will send a password reset link.",
    emailLabel: "Admin Email",
    emailPlaceholder: "admin@kfupm.edu.sa",
    loginPath: "/admin/login",
  },
};

export default function ForgotPassword({ role = "student" }) {
  const content = roleContent[role] ?? roleContent.student;
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await requestPasswordReset({
        email: email.trim().toLowerCase(),
        role,
      });
      setIsSubmitted(true);
      toast.success(data.message || "Password reset email sent.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not send password reset email."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 py-10">
      <div className="w-full max-w-sm">
        <Link to="/">
          <img
            src="/logos/logo-compact.png"
            alt="KMultaqa"
            className="mx-auto mb-8 h-20 w-auto object-contain"
          />
        </Link>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-sm)]">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[var(--foreground)]">{content.title}</h1>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{content.subtitle}</p>
            </div>
          </div>

          {isSubmitted ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-[var(--success)]/20 bg-[var(--success-soft)] p-4 text-sm text-[var(--success)]">
                If an account exists for {email.trim().toLowerCase()}, a reset link has been sent.
              </div>
              <Link to={content.loginPath}>
                <Button className="w-full">Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">{content.emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={content.emailPlaceholder}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </div>

        {!isSubmitted && (
          <Link to={content.loginPath}>
            <Button variant="ghost" className="mt-4 w-full text-[var(--muted-foreground)]">
              Back to Sign In
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
