import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../api/apiClient";
import { resendStudentVerification, verifyStudentEmail } from "../../api/authApi";

const RESEND_COOLDOWN_SECONDS = 60;
const CODE_LENGTH = 6;

export default function StudentEmailVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef(null);
  const email =
    location.state?.email ||
    localStorage.getItem("pendingVerificationEmail") ||
    "";

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCodeChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length < CODE_LENGTH) {
      toast.error(`Please enter the full ${CODE_LENGTH}-digit code.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await verifyStudentEmail({ code });

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      localStorage.setItem("userRole", data.user.role);
      localStorage.removeItem("pendingVerificationEmail");
      localStorage.removeItem("pendingVerificationStudentId");
      toast.success(data.message || "Email verified successfully.");
      navigate("/student/dashboard");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Invalid or expired code. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    if (!email) {
      toast.error("Register again or sign in so we know which email to verify.");
      return;
    }

    setIsResending(true);

    try {
      const { data } = await resendStudentVerification({ email });
      toast.success(data.message || "A new verification code has been sent.");
      startCooldown();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not resend the verification code."));
    } finally {
      setIsResending(false);
    }
  };

  const isCodeComplete = code.length === CODE_LENGTH;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/20 flex flex-col items-center justify-center p-4">

      <img
        src="/logos/logo-compact.png"
        alt="KMultaqa"
        className="h-20 w-auto object-contain mb-8"
      />

      <Card className="w-full max-w-md p-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Verify Your Email</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We sent a verification code to {email || "your university email"}. Enter the code below to verify your account.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={CODE_LENGTH}
              value={code}
              onChange={handleCodeChange}
              className="text-center tracking-[0.4em] text-lg font-mono"
              required
            />
            <p className="text-xs text-muted-foreground">
              Check your <span className="font-medium">@kfupm.edu.sa</span> inbox. The code expires in 10 minutes.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isCodeComplete || isSubmitting}
          >
            {isSubmitting ? "Verifying…" : "Verify Code"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-3">Didn't receive the code?</p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
          >
            {isResending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
          </Button>
        </div>

        <div className="mt-3">
          <Link to="/student/register">
            <Button variant="ghost" className="w-full">
              Back to Registration
            </Button>
          </Link>
        </div>

      </Card>
    </div>
  );
}
