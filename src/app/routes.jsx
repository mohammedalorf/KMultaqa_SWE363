import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import StudentLogin from "./pages/student/StudentLogin";
import StudentDashboard from "./pages/student/StudentDashboard";
import ExploreClubs from "./pages/student/ExploreClubs";
import MyEvents from "./pages/student/MyEvents";
import NotificationSettings from "./pages/student/NotificationSettings";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import Announcements from "./pages/admin/Announcements";
import ClubLogin from "./pages/club/ClubLogin";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/student/login",
    element: <StudentLogin />,
  },
  {
    path: "/student/dashboard",
    element: <StudentDashboard />,
  },
  {
    path: "/student/explore",
    element: <ExploreClubs />,
  },
  {
    path: "/student/my-events",
    element: <MyEvents />,
  },
  {
    path: "/student/settings",
    element: <NotificationSettings />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/settings",
    element: <AdminSettings />,
  },
  {
    path: "/admin/announcements",
    element: <Announcements />,
  },
  {
    path: "/club/login",
    element: <ClubLogin />,
  },
]);
