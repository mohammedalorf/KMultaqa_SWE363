import { LayoutDashboard, User, FileText, Calendar, Users } from "lucide-react";

const iconClass = "w-4 h-4";

export const clubSidebarSections = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", path: "/club/dashboard", icon: <LayoutDashboard className={iconClass} /> }
    ]
  },
  {
    title: "Workspace",
    items: [
      { label: "Profile Settings", path: "/club/profile", icon: <User className={iconClass} /> },
      { label: "My Posts", path: "/club/posts", icon: <FileText className={iconClass} /> },
      { label: "My Events", path: "/club/events", icon: <Calendar className={iconClass} /> }
    ]
  },
  {
    title: "Community",
    items: [
      { label: "Followers", path: "/club/followers", icon: <Users className={iconClass} /> }
    ]
  }
];

export const clubUser = { name: "IEEE KFUPM Student Branch", logo: "🏫" };
