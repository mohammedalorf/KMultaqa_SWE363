import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { getApiErrorMessage } from "../../api/apiClient";
import { getClubProfile, updateClubProfile } from "../../api/clubApi";

const categories = [
  { value: "academic", label: "Academic" },
  { value: "technical", label: "Technical" },
  { value: "sports", label: "Sports" },
  { value: "volunteering", label: "Volunteering" },
  { value: "cultural", label: "Cultural" },
  { value: "social", label: "Social" },
  { value: "other", label: "Other" },
];

const emptyForm = {
  clubName: "",
  category: "other",
  description: "",
  email: "",
  logoUrl: "",
  bannerUrl: "",
  socialLinks: {
    instagram: "",
    twitter: "",
    linkedin: "",
    website: "",
  },
};

export default function ClubProfile() {
  const [form, setForm] = useState(emptyForm);
  const [savedForm, setSavedForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadProfile = async () => {
    setIsLoading(true);

    try {
      const { data } = await getClubProfile();
      const nextForm = {
        clubName: data.club?.clubName ?? "",
        category: data.club?.category ?? "other",
        description: data.club?.description ?? "",
        email: data.club?.email ?? "",
        logoUrl: data.club?.logoUrl ?? "",
        bannerUrl: data.club?.bannerUrl ?? "",
        socialLinks: {
          instagram: data.club?.socialLinks?.instagram ?? "",
          twitter: data.club?.socialLinks?.twitter ?? "",
          linkedin: data.club?.socialLinks?.linkedin ?? "",
          website: data.club?.socialLinks?.website ?? "",
        },
      };

      setForm(nextForm);
      setSavedForm(nextForm);
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
      toast.error("Description must be between 20 and 500 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Contact email must be a valid email address.");
      return;
    }

    setIsSaving(true);

    try {
      const { data } = await updateClubProfile(form);
      const nextForm = {
        clubName: data.club?.clubName ?? "",
        category: data.club?.category ?? "other",
        description: data.club?.description ?? "",
        email: data.club?.email ?? "",
        logoUrl: data.club?.logoUrl ?? "",
        bannerUrl: data.club?.bannerUrl ?? "",
        socialLinks: {
          instagram: data.club?.socialLinks?.instagram ?? "",
          twitter: data.club?.socialLinks?.twitter ?? "",
          linkedin: data.club?.socialLinks?.linkedin ?? "",
          website: data.club?.socialLinks?.website ?? "",
        },
      };

      setForm(nextForm);
      setSavedForm(nextForm);
      toast.success(data.message || "Profile updated successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update profile."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace"
        title="Profile Settings"
        subtitle="Manage your club's public profile information."
      />

      <Section title="Public Profile" description="Information visible to students on your club page.">
        <Card className="p-6">
          {isLoading ? (
            <div className="text-sm text-[var(--muted-foreground)]">Loading profile...</div>
          ) : (
            <div className="space-y-6">
              <div>
                <Label>Club Logo</Label>
                <div className="flex items-center gap-4 mt-2">
                  {form.logoUrl ? (
                    <img
                      src={form.logoUrl}
                      alt={form.clubName}
                      className="w-24 h-24 rounded-full object-cover border border-[var(--border)] bg-[var(--accent)]"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-[var(--primary-soft)] text-[var(--primary)] rounded-full flex items-center justify-center text-3xl font-semibold">
                      {form.clubName?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                <Label htmlFor="description">Club Description</Label>
                <Textarea id="description" value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={5} />
                <p className="text-sm text-[var(--muted-foreground)] mt-1">{form.description.length} / 500 characters</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input id="logoUrl" value={form.logoUrl} onChange={(e) => updateField("logoUrl", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="bannerUrl">Banner URL</Label>
                  <Input id="bannerUrl" value={form.bannerUrl} onChange={(e) => updateField("bannerUrl", e.target.value)} />
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" value={form.socialLinks.instagram} onChange={(e) => updateSocialLink("instagram", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input id="twitter" value={form.socialLinks.twitter} onChange={(e) => updateSocialLink("twitter", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" value={form.socialLinks.linkedin} onChange={(e) => updateSocialLink("linkedin", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" value={form.socialLinks.website} onChange={(e) => updateSocialLink("website", e.target.value)} />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      </Section>
    </PageContainer>
  );
}
