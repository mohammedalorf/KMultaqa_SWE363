import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  ShieldCheck, Users, School, Megaphone, CalendarDays, BellRing, ShieldAlert,
  ArrowRight, Check
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-20 bg-[var(--card)]/95 backdrop-blur-md border-b border-[var(--border)] shadow-[var(--shadow-xs)]">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center shrink-0">
            <img
              src="/logos/logo-horizontal.png"
              alt="KMultaqa — KFUPM Clubs Platform"
              className="h-14 w-auto object-contain"
            />
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link to="/student/login">
              <Button variant="ghost" size="sm">Student</Button>
            </Link>
            <Link to="/club/login">
              <Button variant="ghost" size="sm">Club</Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="outline" size="sm">Administrator</Button>
            </Link>
          </div>
          {/* Mobile CTA */}
          <div className="md:hidden">
            <Link to="/student/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden flex-1">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(1400px 500px at 50% -60px, rgba(30,58,95,0.08) 0%, transparent 65%), radial-gradient(800px 400px at 85% 15%, rgba(42,157,143,0.07) 0%, transparent 60%)",
          }}
        />
        <div className="container mx-auto px-6 pt-20 pb-18 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-1.5 text-xs font-medium text-[var(--muted-foreground)] shadow-[var(--shadow-xs)] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] shrink-0" />
            Official KFUPM student clubs platform
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--foreground)] mb-6 leading-[1.1]">
            One place for every<br />
            <span className="text-[var(--primary)]">KFUPM club</span>.
          </h1>
          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-xl mx-auto mb-10 leading-relaxed">
            Discover clubs, follow announcements, register for events, and stay connected with campus life — all in one modern platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/student/login">
              <Button size="lg" className="gap-2">
                Continue as Student
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/club/login">
              <Button size="lg" variant="outline">Club Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Role cards */}
      <section className="container mx-auto px-6 pb-20 -mt-2">
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <RoleCard
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Administrator"
            desc="Oversee clubs, moderate content, approve requests, and keep the platform healthy."
            features={["Club approvals & management", "Content moderation", "Platform reports"]}
            to="/admin/login"
            cta="Admin Login"
          />
          <RoleCard
            icon={<Users className="w-5 h-5" />}
            title="Student"
            desc="Follow your favorite clubs, register for events, and stay in the loop on campus."
            features={["Personalized feed", "Event registration", "Club discovery"]}
            to="/student/login"
            cta="Student Login"
            featured
          />
          <RoleCard
            icon={<School className="w-5 h-5" />}
            title="Club Representative"
            desc="Run your club workspace — publish posts, plan events, and grow your community."
            features={["Post announcements", "Create & manage events", "Track followers"]}
            to="/club/login"
            cta="Club Login"
          />
        </div>
      </section>

      {/* Features strip */}
      <section className="border-t border-[var(--border)] bg-[var(--card)]">
        <div className="container mx-auto px-6 py-16 max-w-5xl">
          <div className="text-center mb-10">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--teal)] mb-3">Platform</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">Built for campus life</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)] max-w-md mx-auto">Everything you need to connect students and clubs in one cohesive experience.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureItem icon={<Megaphone className="w-5 h-5" />} title="Announcements" desc="Stay informed with news and updates from clubs you follow." />
            <FeatureItem icon={<CalendarDays className="w-5 h-5" />} title="Event Registration" desc="Register for workshops, competitions, and campus events in a click." />
            <FeatureItem icon={<BellRing className="w-5 h-5" />} title="Smart Notifications" desc="Get notified about new posts and events that matter to you." />
            <FeatureItem icon={<ShieldAlert className="w-5 h-5" />} title="Safe Community" desc="Report inappropriate content and keep a respectful environment." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--card)]">
        <div className="container mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/logos/logo-compact.png" alt="KMultaqa" className="h-10 w-auto object-contain opacity-70" />
          <p className="text-sm text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} KFUPM Clubs Multaqa
          </p>
        </div>
      </footer>
    </div>
  );
}

function RoleCard({ icon, title, desc, features, to, cta, featured = false }) {
  return (
    <Card
      interactive
      className={`p-6 flex flex-col ${featured ? "ring-2 ring-[var(--primary)]/20 shadow-[var(--shadow-md)]" : ""}`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${featured ? "bg-[var(--primary)] text-white" : "bg-[var(--primary-soft)] text-[var(--primary)]"}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-1.5 tracking-tight">{title}</h3>
      <p className="text-sm text-[var(--muted-foreground)] mb-4 leading-relaxed">{desc}</p>
      <ul className="space-y-2 mb-6 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Check className="w-3.5 h-3.5 text-[var(--teal)] shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link to={to} className="block mt-auto">
        <Button className="w-full" variant={featured ? "default" : "outline"}>
          {cta}
        </Button>
      </Link>
    </Card>
  );
}

function FeatureItem({ icon, title, desc }) {
  return (
    <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-[var(--shadow-xs)]">
      <div className="w-9 h-9 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mb-3 shrink-0">
        {icon}
      </div>
      <div className="font-semibold text-sm mb-1 text-[var(--foreground)]">{title}</div>
      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{desc}</p>
    </div>
  );
}
