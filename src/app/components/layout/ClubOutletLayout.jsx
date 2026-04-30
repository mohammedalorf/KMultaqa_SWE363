import { Outlet } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { clubSidebarSections } from "../../pages/club/_sidebar";

function getStoredClub() {
  try {
    const storedUser = JSON.parse(localStorage.getItem("authUser") || "null");
    return {
      name: storedUser?.clubName || storedUser?.name || "Club",
      logo: storedUser?.clubName?.charAt(0) || storedUser?.name?.charAt(0) || "C",
    };
  } catch {
    return {
      name: "Club",
      logo: "C",
    };
  }
}

export function ClubOutletLayout() {
  const club = getStoredClub();

  return (
    <DashboardLayout role="club" userName={club.name} userLogo={club.logo} sidebarItems={clubSidebarSections}>
      <Outlet />
    </DashboardLayout>
  );
}
