import { useEffect, useState } from "react";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { Card } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../api/apiClient";
import {
  getStudentSettings,
  unfollowStudentClub,
  updateStudentSettings,
} from "../../api/studentApi";

function buildClubSettings(clubs) {
  return clubs.reduce((acc, club) => {
    acc[club.id] = {
      email: club.email,
      inApp: club.inApp,
    };
    return acc;
  }, {});
}

export default function NotificationSettings() {
  const [emailVerified, setEmailVerified] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [followedClubs, setFollowedClubs] = useState([]);
  const [globalSettings, setGlobalSettings] = useState({ email: "on" });
  const [clubSettings, setClubSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [unfollowingClubId, setUnfollowingClubId] = useState(null);
  const globalEmailOff = globalSettings.email === "off";

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setIsLoading(true);

      try {
        const { data } = await getStudentSettings();

        if (cancelled) {
          return;
        }

        setEmailVerified(Boolean(data.student?.isVerified));
        setFollowedClubs(data.followedClubs || []);
        setGlobalSettings(data.globalSettings || { email: "on" });
        setClubSettings(buildClubSettings(data.followedClubs || []));
      } catch (error) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error, "Could not load notification settings."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = (clubId, type) => {
    if (type === "email" && (!emailVerified || globalEmailOff)) {
      return;
    }

    setClubSettings((prev) => ({
      ...prev,
      [clubId]: {
        email: prev[clubId]?.email ?? true,
        inApp: prev[clubId]?.inApp ?? true,
        [type]: !(prev[clubId]?.[type] ?? true),
      },
    }));
  };

  const handleGlobalEmailChange = (value) => {
    setGlobalSettings((prev) => ({ ...prev, email: value }));

    if (value === "off") {
      setClubSettings((prev) => {
        return Object.fromEntries(
          Object.entries(prev).map(([clubId, settings]) => [
            clubId,
            {
              ...settings,
              email: false,
            },
          ])
        );
      });
    }
  };

  const handleUnfollow = async (clubId) => {
    const previousClubs = followedClubs;
    const previousSettings = clubSettings;

    setUnfollowingClubId(clubId);
    setFollowedClubs((prev) => prev.filter((club) => club.id !== clubId));
    setClubSettings((prev) => {
      const updated = { ...prev };
      delete updated[clubId];
      return updated;
    });

    try {
      await unfollowStudentClub(clubId);
    } catch (error) {
      setFollowedClubs(previousClubs);
      setClubSettings(previousSettings);
      toast.error(getApiErrorMessage(error, "Could not unfollow club."));
    } finally {
      setUnfollowingClubId(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { data } = await updateStudentSettings({
        globalSettings,
        clubSettings,
      });

      setEmailVerified(Boolean(data.student?.isVerified));
      setFollowedClubs(data.followedClubs || []);
      setGlobalSettings(data.globalSettings || { email: "on" });
      setClubSettings(buildClubSettings(data.followedClubs || []));
      setShowSaveDialog(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save notification settings."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageContainer size="narrow">
        <PageHeader
          eyebrow="Personal"
          title="Clubs & Notifications"
          subtitle="Manage followed clubs and notification preferences in one place"
        />

        <Section title="Global Settings">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 p-4 bg-[var(--accent)]/50 rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="w-5 h-5 text-[var(--primary)] shrink-0" />
                  <div className="min-w-0">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-[var(--muted-foreground)]">Receive notifications via university email</p>
                  </div>
                </div>
                <Select
                  value={globalSettings.email}
                  onValueChange={handleGlobalEmailChange}
                  disabled={isLoading || !emailVerified}
                >
                  <SelectTrigger className="w-32 shrink-0">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on">On</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </Section>

        <Section title="Followed Clubs">
          <Card className="p-6">
            {isLoading ? (
              <p className="text-sm text-[var(--muted-foreground)]">Loading followed clubs...</p>
            ) : followedClubs.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">You are not following any clubs.</p>
            ) : (
              <div className="space-y-4">
                {followedClubs.map((club) => {
                  const clubId = club.id;
                  return (
                    <div key={clubId} className="p-4 border border-[var(--border)] rounded-lg">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 bg-[var(--accent)] rounded-full flex items-center justify-center overflow-hidden font-semibold text-[var(--primary)] shrink-0">
                            {club.logoUrl ? (
                              <img src={club.logoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              club.clubName?.charAt(0) || "C"
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{club.clubName}</div>
                            <div className="text-sm text-[var(--muted-foreground)] capitalize truncate">{club.category}</div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnfollow(clubId)}
                          disabled={unfollowingClubId === clubId}
                        >
                          {unfollowingClubId === clubId ? "Unfollowing..." : "Unfollow"}
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <Label className="text-sm">Email Notifications</Label>
                            <p className="text-xs text-[var(--muted-foreground)]">Get emails for new posts and events</p>
                          </div>
                          <Switch
                            checked={!globalEmailOff && (clubSettings[clubId]?.email ?? true)}
                            onCheckedChange={() => handleToggle(clubId, "email")}
                            disabled={!emailVerified || globalEmailOff}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <Label className="text-sm">In-App Notifications</Label>
                            <p className="text-xs text-[var(--muted-foreground)]">Show notifications in the app</p>
                          </div>
                          <Switch
                            checked={clubSettings[clubId]?.inApp ?? true}
                            onCheckedChange={() => handleToggle(clubId, "inApp")}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-6">
              <Button onClick={handleSave} disabled={isLoading || isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        </Section>
      </PageContainer>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changes Saved</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--muted-foreground)]">
            Your clubs and notification preferences have been updated successfully.
          </p>
          <DialogFooter>
            <Button onClick={() => setShowSaveDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
