import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

import StudentLogin from "./pages/student/StudentLogin";
import StudentRegister from "./pages/student/StudentRegister";
import StudentDashboard from "./pages/student/StudentDashboard";
import ExploreClubs from "./pages/student/ExploreClubs";
import MyEventsStudent from "./pages/student/MyEvents";
import NotificationSettings from "./pages/student/NotificationSettings";
import ClubProfileView from "./pages/student/ClubProfileView";
import EventRegistration from "./pages/student/EventRegistration";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Announcements from "./pages/admin/Announcements";
import ClubApprovals from "./pages/admin/ClubApprovals";
import ClubManagement from "./pages/admin/ClubManagement";
import ExportReports from "./pages/admin/ExportReports";
import ReportsModeration from "./pages/admin/ReportsModeration";
import Appeals from "./pages/admin/Appeals";

import ClubLogin from "./pages/club/ClubLogin";
import ClubDashboard from "./pages/club/ClubDashboard";
import ClubProfile from "./pages/club/ClubProfile";
import MyPosts from "./pages/club/MyPosts";
import CreatePost from "./pages/club/CreatePost";
import EditPost from "./pages/club/EditPost";
import MyEvents from "./pages/club/MyEvents";
import CreateEvent from "./pages/club/CreateEvent";
import EditEvent from "./pages/club/EditEvent";
import ViewRegistrations from "./pages/club/ViewRegistrations";
import Followers from "./pages/club/Followers";

function RoleGuard({ role, children }) {
  const currentRole = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
  if (currentRole !== role) {
    return <Navigate to={`/${role}/login`} replace />;
  }
  return children;
}

const guard = (role, element) => <RoleGuard role={role}>{element}</RoleGuard>;

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage />, errorElement: <NotFound /> },

  { path: "/student/login", element: <StudentLogin /> },
  { path: "/student/register", element: <StudentRegister /> },
  { path: "/student/dashboard", element: guard("student", <StudentDashboard />) },
  { path: "/student/explore", element: guard("student", <ExploreClubs />) },
  { path: "/student/my-events", element: guard("student", <MyEventsStudent />) },
  { path: "/student/settings", element: guard("student", <NotificationSettings />) },
  { path: "/student/club/:id", element: guard("student", <ClubProfileView />) },
  { path: "/student/event/:id", element: guard("student", <EventRegistration />) },

  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/admin/dashboard", element: guard("admin", <AdminDashboard />) },
  { path: "/admin/announcements", element: guard("admin", <Announcements />) },
  { path: "/admin/club-approvals", element: guard("admin", <ClubApprovals />) },
  { path: "/admin/club-management", element: guard("admin", <ClubManagement />) },
  { path: "/admin/export", element: guard("admin", <ExportReports />) },
  { path: "/admin/reports", element: guard("admin", <ReportsModeration />) },
  { path: "/admin/appeals", element: guard("admin", <Appeals />) },

  { path: "/club/login", element: <ClubLogin /> },
  { path: "/club/dashboard", element: guard("club", <ClubDashboard />) },
  { path: "/club/profile", element: guard("club", <ClubProfile />) },
  { path: "/club/posts", element: guard("club", <MyPosts />) },
  { path: "/club/posts/new", element: guard("club", <CreatePost />) },
  { path: "/club/posts/edit/:id", element: guard("club", <EditPost />) },
  { path: "/club/events", element: guard("club", <MyEvents />) },
  { path: "/club/events/new", element: guard("club", <CreateEvent />) },
  { path: "/club/events/edit/:id", element: guard("club", <EditEvent />) },
  { path: "/club/registrations/:id", element: guard("club", <ViewRegistrations />) },
  { path: "/club/followers", element: guard("club", <Followers />) },

  { path: "*", element: <NotFound /> }
]);
