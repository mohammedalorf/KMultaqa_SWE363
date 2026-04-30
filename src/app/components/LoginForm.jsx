import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Check } from "lucide-react";
import { getLoginNotice } from "../utils/authRedirect";

const ROLE_CONTENT = {
  student: {
    eyebrow: "Student Portal",
    headline: "Stay connected with campus clubs",
    features: [
      "Personalized feed from followed clubs",
      "Register for campus events",
      "Discover and explore new clubs",
    ],
  },
  club: {
    eyebrow: "Club Portal",
    headline: "Manage your club workspace",
    features: [
      "Publish posts and announcements",
      "Create and manage events",
      "Engage with your followers",
    ],
  },
  admin: {
    eyebrow: "Admin Portal",
    headline: "Platform administration center",
    features: [
      "Review and approve club applications",
      "Moderate reported content",
      "Generate and export platform reports",
    ],
  },
};

export default function LoginForm({
  title,
  subtitle,
  icon: Icon,
  emailLabel = "Email Address",
  emailPlaceholder,
  navigateTo,
  backTo = "/",
  showRegister = false,
  registerText,
  registerButtonText,
  onRegister,
  onLogin,
  role = "student",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loginNotice = getLoginNotice(location);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const shouldNavigate = await onLogin?.({ email, password });

      if (shouldNavigate !== false) {
        navigate(navigateTo);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = ROLE_CONTENT[role] || ROLE_CONTENT.student;

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
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
            <div className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-4">
              {content.eyebrow}
            </div>
            <h2 className="text-[1.85rem] font-bold text-white leading-tight mb-8 tracking-tight">
              {content.headline}
            </h2>
            <ul className="space-y-4">
              {content.features.map((f) => (
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

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--background)] px-6 py-10 sm:px-10 min-w-0">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <img
            src="/logos/logo-compact.png"
            alt="KMultaqa"
            className="h-20 w-auto object-contain mx-auto"
          />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight mb-1.5">{title}</h1>
            <p className="text-sm text-[var(--muted-foreground)]">{subtitle}</p>
          </div>

          {loginNotice && (
            <div className="mb-4 rounded-lg border border-[var(--destructive)]/25 bg-[var(--destructive)]/10 px-4 py-3 text-sm text-[var(--destructive)]" role="alert">
              {loginNotice}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder={emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-[var(--primary)] hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {showRegister && (
            <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
              <p className="text-sm text-[var(--muted-foreground)] mb-3">{registerText}</p>
              <Button variant="outline" className="w-full" onClick={onRegister}>
                {registerButtonText}
              </Button>
            </div>
          )}

          <div className="mt-5">
            <Link to={backTo}>
              <Button variant="ghost" className="w-full text-[var(--muted-foreground)]">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
