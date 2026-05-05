import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BellOff, Calendar, Clock, Edit3, FileText, Flag, Heart, MapPin, Pin, Users } from "lucide-react";
import { EmptyState } from "../../components/layout/EmptyState";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { getApiErrorMessage } from "../../api/apiClient";
import { getClubDashboard, getClubEvents, getClubPosts, getClubProfile, updateClubProfile } from "../../api/clubApi";
import { ImageUploadField } from "../../components/ImageUploadField";
import { SocialLinkIcons } from "../../components/SocialLinkIcons";

const categories = [
  { value: "academic", label: "Academic" },
  { value: "technical", label: "Technical" },
  { value: "sports", label: "Sports" },
  { value: "volunteering", label: "Volunteering" },
  { value: "cultural", label: "Cultural" },
  { value: "social", label: "Social" },
  { value: "other", label: "Other" },
];

const defaultAccentColor = "#1e3a5f";
const defaultBackgroundColor = "#f8fafc";
const defaultCardColor = "#ffffff";
const defaultPrimaryTextColor = "#111827";
const defaultSecondaryTextColor = "#6b7280";
const tabItems = ["posts", "events", "about"];

const emptyForm = {
  clubName: "",
  category: "other",
  description: "",
  email: "",
  logoUrl: "",
  bannerUrl: "",
  status: "active",
  accentColor: defaultAccentColor,
  backgroundColor: defaultBackgroundColor,
  cardColor: defaultCardColor,
  primaryTextColor: defaultPrimaryTextColor,
  secondaryTextColor: defaultSecondaryTextColor,
  logoShape: "circle",
  socialLinks: {
    instagram: "",
    twitter: "",
    linkedin: "",
    website: "",
  },
};

const emptyStats = {
  followers: 0,
  totalPosts: 0,
  upcomingEvents: 0,
};

function getAccentColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : defaultAccentColor;
}

function getBackgroundColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : defaultBackgroundColor;
}

function getCardColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : defaultCardColor;
}

function getPrimaryTextColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : defaultPrimaryTextColor;
}

function getSecondaryTextColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : defaultSecondaryTextColor;
}

function hexToRgba(hex, alpha) {
  const normalized = getAccentColor(hex).replace("#", "");
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildForm(club) {
  return {
    clubName: club?.clubName ?? "",
    category: club?.category ?? "other",
    description: club?.description ?? "",
    email: club?.email ?? "",
    logoUrl: club?.logoUrl ?? "",
    bannerUrl: club?.bannerUrl ?? "",
    status: club?.status ?? "active",
    accentColor: getAccentColor(club?.accentColor ?? club?.themeColor),
    backgroundColor: getBackgroundColor(club?.backgroundColor),
    cardColor: getCardColor(club?.cardColor),
    primaryTextColor: getPrimaryTextColor(club?.primaryTextColor),
    secondaryTextColor: getSecondaryTextColor(club?.secondaryTextColor),
    logoShape: club?.logoShape === "rounded-square" ? "rounded-square" : "circle",
    socialLinks: {
      instagram: club?.socialLinks?.instagram ?? "",
      twitter: club?.socialLinks?.twitter ?? "",
      linkedin: club?.socialLinks?.linkedin ?? "",
      website: club?.socialLinks?.website ?? "",
    },
  };
}

function syncStoredClubSession(club) {
  try {
    const storedUser = JSON.parse(localStorage.getItem("authUser") || "null") || {};
    localStorage.setItem(
      "authUser",
      JSON.stringify({
        ...storedUser,
        name: club.clubName,
        clubName: club.clubName,
        logoUrl: club.logoUrl || "",
      })
    );
    window.dispatchEvent(new Event("kmultaqa:auth-user-updated"));
  } catch {
    // Profile updates should still succeed if localStorage is unavailable.
  }
}

function ClubAvatar({ logoUrl, name, logoShape = "circle", hero = false }) {
  const sizeClass = hero ? "h-[100px] w-[100px] text-4xl" : "h-12 w-12 text-base";
  const borderClass = hero ? "border-4 border-white shadow-[var(--shadow-md)]" : "";
  const shapeClass = getLogoShapeClass(logoShape);

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${sizeClass} ${borderClass} ${shapeClass} bg-[var(--card)] object-cover shrink-0`}
      />
    );
  }

  return (
    <div className={`${sizeClass} ${borderClass} ${shapeClass} bg-[var(--card)] text-[var(--primary)] flex items-center justify-center font-semibold shrink-0`}>
      {name?.charAt(0)?.toUpperCase() || "C"}
    </div>
  );
}

function ProfileStat({ icon, value, label, accentColor, cardColor }) {
  return (
    <div
      className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-left text-[var(--card-foreground)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--accent)]/35"
      style={{ backgroundColor: cardColor, borderColor: "transparent", color: "var(--profile-primary-text)" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold">{value}</div>
          <div className="text-sm text-[var(--profile-secondary-text)]">{label}</div>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: hexToRgba(accentColor, 0.14), color: accentColor }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function AboutRow({ label, children }) {
  return (
    <div>
      <div className="text-sm font-medium">{label}</div>
      <div className="mt-1 text-sm text-[var(--profile-secondary-text)]">{children}</div>
    </div>
  );
}

function getLogoShapeClass(shape) {
  return shape === "rounded-square" ? "rounded-2xl" : "rounded-full";
}

function formatDate(value) {
  if (!value) return "Date TBA";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "Time TBA";

  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ClubProfile() {
  const [form, setForm] = useState(emptyForm);
  const [savedForm, setSavedForm] = useState(emptyForm);
  const [stats, setStats] = useState(emptyStats);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const loadProfile = async () => {
    setIsLoading(true);

    try {
      const [profileResult, dashboardResult, postsResult, eventsResult] = await Promise.all([
        getClubProfile(),
        getClubDashboard().catch(() => ({ data: {} })),
        getClubPosts().catch(() => ({ data: { posts: [] } })),
        getClubEvents().catch(() => ({ data: { events: [] } })),
      ]);
      const nextForm = buildForm(profileResult.data.club);
      const nextPosts = postsResult.data.posts ?? [];
      const nextEvents = eventsResult.data.events ?? [];

      setForm(nextForm);
      setSavedForm(nextForm);
      setPosts(nextPosts);
      setEvents(nextEvents);
      setStats({
        followers: profileResult.data.club?.followers ?? dashboardResult.data.stats?.followers ?? 0,
        totalPosts: nextPosts.length || dashboardResult.data.stats?.totalPosts || 0,
        upcomingEvents: nextEvents.length || dashboardResult.data.stats?.upcomingEvents || 0,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not load profile."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateSocialLink = (field, value) => {
    setForm((current) => ({
      ...current,
      socialLinks: {
        ...current.socialLinks,
        [field]: value,
      },
    }));
  };

  const handleCancel = () => {
    setForm(savedForm);
    setIsEditOpen(false);
  };

  const handleSave = async () => {
    if (!form.clubName.trim()) {
      toast.error("Club name is required.");
      return;
    }

    if (!form.category) {
      toast.error("Category is required.");
      return;
    }

    if (form.description.trim().length < 20 || form.description.trim().length > 500) {
      toast.error("Bio must be between 20 and 500 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Contact email must be a valid email address.");
      return;
    }

    if (!/^#[0-9a-f]{6}$/i.test(form.accentColor)) {
      toast.error("Accent color must be a valid hex color.");
      return;
    }

    if (!/^#[0-9a-f]{6}$/i.test(form.backgroundColor)) {
      toast.error("Background color must be a valid hex color.");
      return;
    }

    if (!/^#[0-9a-f]{6}$/i.test(form.cardColor)) {
      toast.error("Cards color must be a valid hex color.");
      return;
    }

    if (!/^#[0-9a-f]{6}$/i.test(form.primaryTextColor)) {
      toast.error("Primary text color must be a valid hex color.");
      return;
    }

    if (!/^#[0-9a-f]{6}$/i.test(form.secondaryTextColor)) {
      toast.error("Secondary text color must be a valid hex color.");
      return;
    }

    setIsSaving(true);

    try {
      const { data } = await updateClubProfile({
        ...form,
        accentColor: getAccentColor(form.accentColor),
        backgroundColor: getBackgroundColor(form.backgroundColor),
        cardColor: getCardColor(form.cardColor),
        primaryTextColor: getPrimaryTextColor(form.primaryTextColor),
        secondaryTextColor: getSecondaryTextColor(form.secondaryTextColor),
      });
      const nextForm = buildForm(data.club);

      setForm(nextForm);
      setSavedForm(nextForm);
      syncStoredClubSession(data.club);
      setStats((current) => ({
        ...current,
        followers: data.club?.followers ?? current.followers,
      }));
      setIsEditOpen(false);
      toast.success(data.message || "Profile updated successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update profile."));
    } finally {
      setIsSaving(false);
    }
  };

  const accentColor = getAccentColor(form.accentColor);
  const backgroundColor = getBackgroundColor(form.backgroundColor);
  const cardColor = getCardColor(form.cardColor);
  const primaryTextColor = getPrimaryTextColor(form.primaryTextColor);
  const secondaryTextColor = getSecondaryTextColor(form.secondaryTextColor);
  const logoShapeClass = getLogoShapeClass(form.logoShape);
  const profileStyle = {
    backgroundColor,
    color: primaryTextColor,
    "--profile-primary-text": primaryTextColor,
    "--profile-secondary-text": secondaryTextColor,
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace"
        title="Profile Settings"
        subtitle="Manage the public page students see for your club."
        actions={
          <Button onClick={() => setIsEditOpen(true)}>
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </Button>
        }
      />

      {isLoading ? (
        <Card className="p-8 text-center text-sm text-[var(--muted-foreground)]">Loading profile...</Card>
      ) : (
        <div className="space-y-6 rounded-xl p-4 sm:p-6" style={profileStyle}>
          <section className="mb-6">
            <div className="relative">
              <div className="h-56 overflow-hidden rounded-xl sm:h-72">
                {form.bannerUrl ? (
                  <img src={form.bannerUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}, ${hexToRgba(accentColor, 0.52)})`,
                    }}
                  />
                )}
                <div className="absolute inset-0 rounded-xl bg-black/10" />
              </div>

              <div className="absolute bottom-0 left-6 translate-y-1/2">
                <ClubAvatar logoUrl={form.logoUrl} name={form.clubName} logoShape={form.logoShape} hero />
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-16 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="ml-6 text-3xl font-semibold" style={{ color: primaryTextColor }}>{form.clubName}</h2>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  style={{ backgroundColor: accentColor, borderColor: accentColor, color: "#fff" }}
                >
                  <Heart className="h-4 w-4" />
                  Follow
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled
                  aria-label="Enable notifications"
                >
                  <BellOff className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label="Report club">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <ProfileStat icon={<Users className="h-5 w-5" />} value={stats.followers} label="Followers" accentColor={accentColor} cardColor={cardColor} />
            <ProfileStat icon={<Calendar className="h-5 w-5" />} value={stats.upcomingEvents} label="Events" accentColor={accentColor} cardColor={cardColor} />
            <ProfileStat icon={<FileText className="h-5 w-5" />} value={stats.totalPosts} label="Posts" accentColor={accentColor} cardColor={cardColor} />
          </section>

          <div>
            <div className="flex gap-6">
              {tabItems.map((tab) => {
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`border-b-2 px-1 pb-3 text-sm capitalize transition-colors ${
                      isActive ? "font-semibold text-[var(--profile-primary-text)]" : "border-transparent text-[var(--profile-secondary-text)] hover:text-[var(--profile-primary-text)]"
                    }`}
                    style={{ borderBottomColor: isActive ? accentColor : "transparent" }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === "posts" && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <EmptyState title="No posts yet" description="This club has not posted anything yet." />
              ) : (
                posts.map((post) => (
                  <Card
                    key={post.id}
                    className="p-6"
                    style={
                      post.isPinned
                        ? {
                            background: `linear-gradient(135deg, ${hexToRgba(accentColor, 0.1)}, ${cardColor} 54%)`,
                            borderColor: hexToRgba(accentColor, 0.28),
                            color: primaryTextColor,
                          }
                        : { backgroundColor: cardColor, borderColor: "transparent", color: primaryTextColor }
                    }
                  >
                    <div className="flex items-start gap-3">
                      <ClubAvatar logoUrl={form.logoUrl} name={form.clubName} logoShape={form.logoShape} />
                      <div className="min-w-0 flex-1 pt-2">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-xl font-semibold">{form.clubName}</span>
                          {post.isPinned && (
                            <Badge variant="outline" className="text-xs" style={{ borderColor: accentColor, color: accentColor }}>
                              <Pin className="h-3 w-3" />
                              Pinned
                            </Badge>
                          )}
                        </div>
                        <h3 className="mb-2 text-base font-semibold" style={{ color: primaryTextColor }}>{post.title}</h3>
                        <p className="mb-3 text-[var(--profile-secondary-text)]">{post.content}</p>
                        {post.imageUrl && (
                          <img src={post.imageUrl} alt="" className="mb-4 max-h-80 w-full rounded-lg object-cover" />
                        )}
                        <div className="flex items-center justify-between gap-3 text-sm text-[var(--profile-secondary-text)]">
                          <span>{formatDate(post.createdAt)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label="Like post"
                            style={{ color: accentColor }}
                          >
                            <Heart className="h-4 w-4" />
                            <span>{post.likesCount ?? 0}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "events" && (
            <div className="space-y-4">
              {events.length === 0 ? (
                <EmptyState title="No upcoming events" description="Check back soon for new events." />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {events.map((event) => (
                    <Card key={event.id} className="overflow-hidden transition-colors hover:bg-[var(--accent)]" style={{ backgroundColor: cardColor, borderColor: "transparent", color: primaryTextColor }}>
                      {event.imageUrl && <img src={event.imageUrl} alt="" className="h-40 w-full object-cover" />}
                      <div className="p-6">
                        <h3 className="mb-2 text-lg font-semibold" style={{ color: primaryTextColor }}>{event.title}</h3>
                        <p className="mb-4 text-sm text-[var(--profile-secondary-text)]">{event.content ?? event.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[var(--profile-secondary-text)]" />
                            <span>{formatDate(event.startDateTime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-[var(--profile-secondary-text)]" />
                            <span>{event.hasStartTime === false ? "Time TBA" : formatTime(event.startDateTime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[var(--profile-secondary-text)]" />
                            <span>{event.location || "Location TBA"}</span>
                          </div>
                        </div>
                        <Button type="button" className="mt-4 w-full" style={{ backgroundColor: accentColor, color: "#fff" }}>
                          View Event
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "about" && (
            <Card className="p-6" style={{ backgroundColor: cardColor, borderColor: "transparent", color: primaryTextColor }}>
              <h2 className="mb-5 text-xl font-semibold" style={{ color: primaryTextColor }}>About</h2>
              <div className="space-y-5">
                <AboutRow label="Category">
                  <span className="capitalize">{form.category}</span>
                </AboutRow>
                <AboutRow label="Description">
                  {form.description}
                </AboutRow>
                <AboutRow label="Contact">
                  {form.email}
                </AboutRow>
                <SocialLinkIcons
                  socialLinks={form.socialLinks}
                  accentColor={accentColor}
                  className="pt-1"
                />
              </div>
            </Card>
          )}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={(open) => (open ? setIsEditOpen(true) : handleCancel())}>
        <DialogContent className="space-y-5">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUploadField
                id="logoUrl"
                label="Club Logo"
                value={form.logoUrl}
                onChange={(value) => updateField("logoUrl", value)}
                folder="clubs"
                disabled={isSaving}
                previewClassName={`h-32 w-32 ${logoShapeClass}`}
                aspectRatio={1}
              />
              <ImageUploadField
                id="bannerUrl"
                label="Club Banner"
                value={form.bannerUrl}
                onChange={(value) => updateField("bannerUrl", value)}
                folder="clubs"
                disabled={isSaving}
                previewClassName="h-32"
                aspectRatio={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="clubName">Club Name</Label>
                <Input id="clubName" value={form.clubName} onChange={(e) => updateField("clubName", e.target.value)} />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(value) => updateField("category", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Bio</Label>
              <Textarea id="description" value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={5} />
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{form.description.length} / 500 characters</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={accentColor}
                    onChange={(e) => updateField("accentColor", e.target.value)}
                    className="w-14 px-1"
                  />
                  <Input value={form.accentColor} onChange={(e) => updateField("accentColor", e.target.value)} placeholder="#1e3a5f" />
                </div>
              </div>
              <div>
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => updateField("backgroundColor", e.target.value)}
                    className="w-14 px-1"
                  />
                  <Input value={form.backgroundColor} onChange={(e) => updateField("backgroundColor", e.target.value)} placeholder="#f8fafc" />
                </div>
              </div>
              <div>
                <Label htmlFor="cardColor">Cards Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="cardColor"
                    type="color"
                    value={cardColor}
                    onChange={(e) => updateField("cardColor", e.target.value)}
                    className="w-14 px-1"
                  />
                  <Input value={form.cardColor} onChange={(e) => updateField("cardColor", e.target.value)} placeholder="#ffffff" />
                </div>
              </div>
              <div>
                <Label htmlFor="primaryTextColor">Primary Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryTextColor"
                    type="color"
                    value={primaryTextColor}
                    onChange={(e) => updateField("primaryTextColor", e.target.value)}
                    className="w-14 px-1"
                  />
                  <Input value={form.primaryTextColor} onChange={(e) => updateField("primaryTextColor", e.target.value)} placeholder="#111827" />
                </div>
              </div>
              <div>
                <Label htmlFor="secondaryTextColor">Secondary Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryTextColor"
                    type="color"
                    value={secondaryTextColor}
                    onChange={(e) => updateField("secondaryTextColor", e.target.value)}
                    className="w-14 px-1"
                  />
                  <Input value={form.secondaryTextColor} onChange={(e) => updateField("secondaryTextColor", e.target.value)} placeholder="#6b7280" />
                </div>
              </div>
            </div>

            <div>
              <Label>Logo Shape</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={form.logoShape === "circle" ? "default" : "outline"}
                  onClick={() => updateField("logoShape", "circle")}
                  style={form.logoShape === "circle" ? { backgroundColor: accentColor, color: "#fff" } : undefined}
                >
                  Circle
                </Button>
                <Button
                  type="button"
                  variant={form.logoShape === "rounded-square" ? "default" : "outline"}
                  onClick={() => updateField("logoShape", "rounded-square")}
                  style={form.logoShape === "rounded-square" ? { backgroundColor: accentColor, color: "#fff" } : undefined}
                >
                  Rounded Square
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" value={form.socialLinks.instagram} onChange={(e) => updateSocialLink("instagram", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="twitter">X</Label>
                <Input id="twitter" value={form.socialLinks.twitter} onChange={(e) => updateSocialLink("twitter", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" value={form.socialLinks.linkedin} onChange={(e) => updateSocialLink("linkedin", e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} style={{ backgroundColor: accentColor, color: "#fff" }}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
