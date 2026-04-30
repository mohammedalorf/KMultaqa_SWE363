import { DashboardLayout } from "./DashboardLayout";

export function StudentLayout({ userName, navItems, children }) {
  return (
    <DashboardLayout role="student" userName={userName} sidebarItems={navItems}>
      {children}
    </DashboardLayout>
  );
}
