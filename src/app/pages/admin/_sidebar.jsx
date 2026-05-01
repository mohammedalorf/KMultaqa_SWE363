import { LayoutDashboard, CheckSquare, Flag, Users, Megaphone, FileText, Gavel } from "lucide-react";

const iconClass = "w-4 h-4";

export const adminSidebarSections = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className={iconClass} /> }
    ]
  },
  {
    title: "Moderation",
    items: [
      { label: "Club Approvals", path: "/admin/club-approvals", icon: <CheckSquare className={iconClass} /> },
      { label: "Reports", path: "/admin/reports", icon: <Flag className={iconClass} /> },
      { label: "Appeals", path: "/admin/appeals", icon: <Gavel className={iconClass} /> }
    ]
  },
  {
    title: "Management",
    items: [
      { label: "Club Management", path: "/admin/club-management", icon: <Users className={iconClass} /> }
    ]
  },
  {
    title: "Content",
    items: [
      { label: "Announcements", path: "/admin/announcements", icon: <Megaphone className={iconClass} /> }
    ]
  },
  {
    title: "Reports",
    items: [
      { label: "Export Reports", path: "/admin/export", icon: <FileText className={iconClass} /> }
    ]
  }
];

export const adminUser = { name: "Dr. Abdullah Al-Mutairi" };
