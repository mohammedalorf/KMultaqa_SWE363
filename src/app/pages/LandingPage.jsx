import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ShieldCheck, Users, Calendar } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-6">
            <span className="text-4xl">🎓</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-foreground">KFUPM Clubs Platform</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with student clubs, discover events, and engage with the KFUPM community
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Administrator</h3>
              <p className="text-muted-foreground">
                Manage clubs, moderate content, and oversee platform operations
              </p>
              <Link to="/admin/login" className="w-full">
                <Button className="w-full">Admin Login</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow border-2 border-primary">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Club Representative</h3>
              <p className="text-muted-foreground">
                Manage your club profile, publish posts, and organize events
              </p>
              <Link to="/club/login" className="w-full">
                <Button className="w-full">Club Login</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Student</h3>
              <p className="text-muted-foreground">
                Follow clubs, register for events, and stay updated with campus activities
              </p>
              <Link to="/student/login" className="w-full">
                <Button className="w-full">Student Login</Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12">Platform Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xl">📢</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Club Announcements</h4>
                <p className="text-muted-foreground text-sm">
                  Stay informed with the latest news and updates from your favorite clubs
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Event Registration</h4>
                <p className="text-muted-foreground text-sm">
                  Easily register for workshops, competitions, and campus events
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xl">🔔</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Smart Notifications</h4>
                <p className="text-muted-foreground text-sm">
                  Get notified about new posts and events from clubs you follow
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xl">🛡️</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Safe Community</h4>
                <p className="text-muted-foreground text-sm">
                  Report inappropriate content and maintain a respectful environment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
