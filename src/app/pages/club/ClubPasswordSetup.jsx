import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { getApiErrorMessage } from "../../api/apiClient";
import { getClubPasswordSetup, setupClubPassword } from "../../api/authApi";

export default function ClubPasswordSetup() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSetup() {
      setIsLoading(true);

      try {
        const { data } = await getClubPasswordSetup(token);

        if (!cancelled) {
          setClub(data.club);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error, "Password setup link is invalid or expired."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSetup();

    return () => {
      cancelled = true;
    };
  }, [token]);

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
      const { data } = await setupClubPassword({
        token,
        password,
      });

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      localStorage.setItem("userRole", data.user.role);
      toast.success(data.message || "Club password set successfully.");
      navigate("/club/dashboard");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not set club password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-6 py-10">
      <div className="w-full max-w-sm">
        <Link to="/">
          <img src="/logos/logo-compact.png" alt="KMultaqa" className="h-20 w-auto object-contain mx-auto mb-8" />
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight mb-1.5">Set Club Password</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {club ? `Create a password for ${club.clubName}.` : "Validate your setup link before creating a password."}
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-[var(--muted-foreground)]">Loading setup link...</p>
        ) : club ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-lg bg-[var(--accent)]/60 text-sm text-[var(--muted-foreground)]">
              Account email: <span className="font-medium text-[var(--foreground)]">{club.email}</span>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
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
              {isSubmitting ? "Saving..." : "Set Password"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              This password setup link cannot be used. Ask an administrator to approve or resend the club setup email.
            </p>
            <Link to="/club/login">
              <Button variant="outline" className="w-full">Back to Club Login</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
