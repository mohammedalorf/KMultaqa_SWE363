import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { getCurrentUser } from "../../api/authApi";
import { studentSidebarSections } from "../../pages/student/_sidebar";

function getStoredStudentName() {
  try {
    const storedUser = JSON.parse(localStorage.getItem("authUser") || "null");
    return storedUser?.fullName || storedUser?.name || "Student";
  } catch {
    return "Student";
  }
}

export function StudentOutletLayout() {
  const [userName, setUserName] = useState(getStoredStudentName);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then(({ data }) => {
        if (cancelled || !data.user) {
          return;
        }

        localStorage.setItem("authUser", JSON.stringify(data.user));
        setUserName(data.user.fullName || data.user.name || "Student");
      })
      .catch(() => {
        setUserName(getStoredStudentName());
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardLayout role="student" userName={userName} sidebarItems={studentSidebarSections}>
      <Outlet />
    </DashboardLayout>
  );
}
