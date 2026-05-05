import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import StudentLogin from "./pages/student/StudentLogin";
import StudentRegister from "./pages/student/StudentRegister";
import StudentEmailVerification from "./pages/student/StudentEmailVerification";
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

import ClubLogin from "./pages/club/ClubLogin";
import ClubRegister from "./pages/club/ClubRegister";
import ClubPasswordSetup from "./pages/club/ClubPasswordSetup";
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

import { StudentOutletLayout } from "./components/layout/StudentOutletLayout";
import { ClubOutletLayout } from "./components/layout/ClubOutletLayout";
import { AdminOutletLayout } from "./components/layout/AdminOutletLayout";
import {
  ACCESS_DENIED_MESSAGE,
  clearAuthSession,
  getAccessDeniedLoginUrl,
  getLoginPathForRole,
} from "./utils/authRedirect";

function RoleGuard({ role, children }) {
  if (typeof window === "undefined") {
    return children;
  }

  const token = localStorage.getItem("authToken");
  const currentRole = localStorage.getItem("userRole");
  let storedUser = null;

  try {
    storedUser = JSON.parse(localStorage.getItem("authUser") || "null");
  } catch {
    storedUser = null;
  }

  if (!token) {
    return <Navigate to={getLoginPathForRole(role)} replace />;
  }

  if (currentRole !== role || storedUser?.role !== role) {
    clearAuthSession();

    return (
      <Navigate
        to={getAccessDeniedLoginUrl(role)}
        replace
        state={{ message: ACCESS_DENIED_MESSAGE }}
      />
    );
  }

  return children;
}

const guard = (role, element) => <RoleGuard role={role}>{element}</RoleGuard>;

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage />, errorElement: <NotFound /> },

  { path: "/student/login", element: <StudentLogin /> },
  { path: "/student/forgot-password", element: <ForgotPassword role="student" /> },
  { path: "/student/register", element: <StudentRegister /> },
  { path: "/student/verify-email", element: <StudentEmailVerification /> },
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/admin/forgot-password", element: <ForgotPassword role="admin" /> },
  { path: "/club/login", element: <ClubLogin /> },
  { path: "/club/forgot-password", element: <ForgotPassword role="club" /> },
  { path: "/club/register", element: <ClubRegister /> },
  { path: "/club/setup-password/:token", element: <ClubPasswordSetup /> },
  { path: "/reset-password/:token", element: <ResetPassword /> },

  {
    path: "/student",
    element: guard("student", <StudentOutletLayout />),
    children: [
      { path: "dashboard", element: <StudentDashboard /> },
      { path: "explore", element: <ExploreClubs /> },
      { path: "my-events", element: <MyEventsStudent /> },
      { path: "settings", element: <NotificationSettings /> },
      { path: "club/:id", element: <ClubProfileView /> },
      { path: "event/:id", element: <EventRegistration /> },
    ],
  },

  {
    path: "/admin",
    element: guard("admin", <AdminOutletLayout />),
    children: [
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "announcements", element: <Announcements /> },
      { path: "club-approvals", element: <ClubApprovals /> },
      { path: "club-management", element: <ClubManagement /> },
      { path: "export", element: <ExportReports /> },
      { path: "reports", element: <ReportsModeration /> },
    ],
  },

  {
    path: "/club",
    element: guard("club", <ClubOutletLayout />),
    children: [
      { path: "dashboard", element: <ClubDashboard /> },
      { path: "profile", element: <ClubProfile /> },
      { path: "posts", element: <MyPosts /> },
      { path: "posts/new", element: <CreatePost /> },
      { path: "posts/edit/:id", element: <EditPost /> },
      { path: "events", element: <MyEvents /> },
      { path: "events/new", element: <CreateEvent /> },
      { path: "events/edit/:id", element: <EditEvent /> },
      { path: "registrations/:id", element: <ViewRegistrations /> },
      { path: "followers", element: <Followers /> },
    ],
  },

  { path: "*", element: <NotFound /> },
]);
