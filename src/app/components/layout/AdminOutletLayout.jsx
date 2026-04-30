import { Outlet } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { adminSidebarSections } from "../../pages/admin/_sidebar";

function getStoredAdminName() {
  try {
    const storedUser = JSON.parse(localStorage.getItem("authUser") || "null");
    return storedUser?.fullName || storedUser?.name || "Administrator";
  } catch {
    return "Administrator";
  }
}

export function AdminOutletLayout() {
  return (
    <DashboardLayout role="admin" userName={getStoredAdminName()} sidebarItems={adminSidebarSections}>
      <Outlet />
    </DashboardLayout>
  );
}
