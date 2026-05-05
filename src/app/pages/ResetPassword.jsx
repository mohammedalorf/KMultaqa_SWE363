import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { EmptyState } from "../components/layout/EmptyState";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { getApiErrorMessage } from "../api/apiClient";
import { getPasswordReset, resetPassword } from "../api/authApi";

const loginPathByRole = {
  student: "/student/login",
  club: "/club/login",
  admin: "/admin/login",
};

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadResetLink() {
      setIsLoading(true);
      setLoadError("");

      try {
        const { data } = await getPasswordReset(token);

        if (!cancelled) {
          setAccount(data.account);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(error, "Password reset link is invalid or expired."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadResetLink();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const loginPath = loginPathByRole[account?.role] ?? "/";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await resetPassword({ token, password });
      const nextLoginPath = loginPathByRole[data.user?.role] ?? loginPath;
      toast.success(data.message || "Password reset successfully.");
      navigate(nextLoginPath);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not reset password."));
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

        {isLoading ? (
          <Card className="p-8 text-center text-sm text-[var(--muted-foreground)]">
            Validating reset link...
          </Card>
        ) : loadError || !account ? (
          <EmptyState
            icon={<KeyRound className="h-6 w-6" />}
            title="Reset link unavailable"
            description={loadError || "This reset link cannot be used."}
            action={
              <Link to="/">
                <Button>Back to Home</Button>
              </Link>
            }
          />
        ) : (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-sm)]">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[var(--foreground)]">Create New Password</h1>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Reset password for {account.email}.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
