import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Camera, Calendar, Edit3, FileText, Users } from "lucide-react";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { getApiErrorMessage } from "../../api/apiClient";
import { getClubDashboard, getClubProfile, updateClubProfile } from "../../api/clubApi";
import { ImageUploadField } from "../../components/ImageUploadField";

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

const emptyForm = {
  clubName: "",
  category: "other",
  description: "",
  email: "",
  logoUrl: "",
  bannerUrl: "",
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
    whatsapp: "",
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
      whatsapp: club?.socialLinks?.whatsapp ?? "",
    },
  };
}

function ProfileStat({ icon, value, label, accentColor, cardColor }) {
  return (
    <Card className="p-6" style={{ backgroundColor: cardColor, borderColor: "transparent", color: "var(--profile-primary-text)" }}>
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
    </Card>
  );
}

function SummaryRow({ label, children }) {
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

export default function ClubProfile() {
  const [form, setForm] = useState(emptyForm);
  const [savedForm, setSavedForm] = useState(emptyForm);
  const [stats, setStats] = useState(emptyStats);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const loadProfile = async () => {
    setIsLoading(true);

    try {
      const [profileResult, dashboardResult] = await Promise.all([
        getClubProfile(),
        getClubDashboard().catch(() => ({ data: {} })),
      ]);
      const nextForm = buildForm(profileResult.data.club);

      setForm(nextForm);
      setSavedForm(nextForm);
      setStats({
        followers: dashboardResult.data.stats?.followers ?? profileResult.data.club?.followers ?? 0,
        totalPosts: dashboardResult.data.stats?.totalPosts ?? 0,
        upcomingEvents: dashboardResult.data.stats?.upcomingEvents ?? 0,
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
          <section>
            <div className="relative">
              <div className="h-56 overflow-hidden rounded-xl sm:h-64">
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
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-4 top-4 bg-[var(--card)]/95"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Camera className="h-4 w-4" />
                  Edit Banner
                </Button>
              </div>

              <div className="absolute bottom-0 left-6 translate-y-1/2">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt={form.clubName}
                    className={`h-[100px] w-[100px] ${logoShapeClass} border-4 border-white bg-[var(--card)] object-cover shadow-[var(--shadow-md)]`}
                  />
                ) : (
                  <div className={`flex h-[100px] w-[100px] items-center justify-center ${logoShapeClass} border-4 border-white bg-[var(--card)] text-4xl font-semibold text-[var(--primary)] shadow-[var(--shadow-md)]`}>
                    {form.clubName?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-16">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border px-3 py-1 text-xs font-medium capitalize" style={{ borderColor: accentColor }}>
                  {form.category}
                </span>
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: hexToRgba(accentColor, 0.14), color: accentColor }}
                >
                  Public Profile
                </span>
              </div>
              <h2 className="text-3xl font-semibold text-[var(--profile-primary-text)]">{form.clubName}</h2>
              <p className="mt-2 max-w-3xl text-sm text-[var(--profile-secondary-text)]">{form.description}</p>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <ProfileStat icon={<Users className="h-5 w-5" />} value={stats.followers} label="Followers" accentColor={accentColor} cardColor={cardColor} />
            <ProfileStat icon={<Calendar className="h-5 w-5" />} value={stats.upcomingEvents} label="Events" accentColor={accentColor} cardColor={cardColor} />
            <ProfileStat icon={<FileText className="h-5 w-5" />} value={stats.totalPosts} label="Posts" accentColor={accentColor} cardColor={cardColor} />
          </section>

          <Card className="p-6" style={{ backgroundColor: cardColor, borderColor: "transparent", color: primaryTextColor }}>
            <h3 className="mb-5 text-xl font-semibold">About</h3>
            <div className="grid gap-5 md:grid-cols-2">
              <SummaryRow label="Category">
                <span className="capitalize">{form.category}</span>
              </SummaryRow>
              <SummaryRow label="Contact">
                {form.email}
              </SummaryRow>
              <SummaryRow label="Bio">
                {form.description}
              </SummaryRow>
              <SummaryRow label="Accent Color">
                {accentColor}
              </SummaryRow>
              <SummaryRow label="Background Color">
                {backgroundColor}
              </SummaryRow>
              <SummaryRow label="Cards Color">
                {cardColor}
              </SummaryRow>
              <SummaryRow label="Primary Text Color">
                {primaryTextColor}
              </SummaryRow>
              <SummaryRow label="Secondary Text Color">
                {secondaryTextColor}
              </SummaryRow>
            </div>
          </Card>
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
                <Label htmlFor="twitter">Twitter</Label>
                <Input id="twitter" value={form.socialLinks.twitter} onChange={(e) => updateSocialLink("twitter", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp URL</Label>
                <Input id="whatsapp" value={form.socialLinks.whatsapp} onChange={(e) => updateSocialLink("whatsapp", e.target.value)} />
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
