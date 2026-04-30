import { Rss, Search, Calendar, Settings } from "lucide-react";

const iconClass = "w-4 h-4";

export const studentSidebarSections = [
  {
    title: "For You",
    items: [
      { label: "Feed", path: "/student/dashboard", icon: <Rss className={iconClass} /> }
    ]
  },
  {
    title: "Discover",
    items: [
      { label: "Explore Clubs", path: "/student/explore", icon: <Search className={iconClass} /> }
    ]
  },
  {
    title: "Personal",
    items: [
      { label: "My Events", path: "/student/my-events", icon: <Calendar className={iconClass} /> },
      { label: "Settings", path: "/student/settings", icon: <Settings className={iconClass} /> }
    ]
  }
];
