import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { getClubProfile } from "../../api/clubApi";
import { DashboardLayout } from "./DashboardLayout";
import { clubSidebarSections } from "../../pages/club/_sidebar";

function getStoredClub() {
  try {
    const storedUser = JSON.parse(localStorage.getItem("authUser") || "null");
    return {
      name: storedUser?.clubName || storedUser?.name || "Club",
      logo: storedUser?.logoUrl || "",
    };
  } catch {
    return {
      name: "Club",
      logo: "",
    };
  }
}

function updateStoredClub(club) {
  try {
    const storedUser = JSON.parse(localStorage.getItem("authUser") || "null") || {};
    const nextUser = {
      ...storedUser,
      name: club.name,
      clubName: club.name,
      logoUrl: club.logo,
    };

    localStorage.setItem("authUser", JSON.stringify(nextUser));
  } catch {
    // Ignore localStorage sync failures; the rendered state still updates.
  }
}

export function ClubOutletLayout() {
  const [club, setClub] = useState(getStoredClub);

  useEffect(() => {
    let cancelled = false;

    async function loadClubProfile() {
      try {
        const { data } = await getClubProfile();
        const nextClub = {
          name: data.club?.clubName || club.name || "Club",
          logo: data.club?.logoUrl || "",
        };

        if (!cancelled) {
          setClub(nextClub);
          updateStoredClub(nextClub);
        }
      } catch {
        // Keep the locally stored club name/avatar if the profile request fails.
      }
    }

    loadClubProfile();

    const handleAuthUserUpdated = () => {
      setClub(getStoredClub());
    };

    window.addEventListener("kmultaqa:auth-user-updated", handleAuthUserUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener("kmultaqa:auth-user-updated", handleAuthUserUpdated);
    };
  }, [club.name]);

  return (
    <DashboardLayout role="club" userName={club.name} userLogo={club.logo} sidebarItems={clubSidebarSections}>
      <Outlet />
    </DashboardLayout>
  );
}
