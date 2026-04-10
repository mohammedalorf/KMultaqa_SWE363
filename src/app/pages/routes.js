import { createBrowserRouter } from "react-router-dom";
// Landing
import LandingPage from "./pages/LandingPage";
// Error Boundary
import ErrorBoundary from "./components/ErrorBoundary";
// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ClubApprovals from "./pages/admin/ClubApprovals";
import ReportsModeration from "./pages/admin/ReportsModeration";
import ClubManagement from "./pages/admin/ClubManagement";
import Announcements from "./pages/admin/Announcements";
import Appeals from "./pages/admin/Appeals";
import ExportReports from "./pages/admin/ExportReports";
import AdminSettings from "./pages/admin/AdminSettings";
// Club pages
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
// Student pages
import StudentLogin from "./pages/student/StudentLogin";
import StudentDashboard from "./pages/student/StudentDashboard";
import ExploreClubs from "./pages/student/ExploreClubs";
import ClubProfileView from "./pages/student/ClubProfileView";
import EventRegistration from "./pages/student/EventRegistration";
import NotificationSettings from "./pages/student/NotificationSettings";
import MyEventsStudent from "./pages/student/MyEvents";
import NotFoundPage from "./pages/NotFoundPage";
export const router = createBrowserRouter([
    {
        path: "/",
        Component: LandingPage,
        ErrorBoundary: ErrorBoundary,
    },
    // Admin routes
    {
        path: "/admin/login",
        Component: AdminLogin,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/admin/dashboard",
        Component: AdminDashboard,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/admin/club-approvals",
        Component: ClubApprovals,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/admin/reports",
        Component: ReportsModeration,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/admin/club-management",
        Component: ClubManagement,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/admin/announcements",
        Component: Announcements,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/admin/appeals",
        Component: Appeals,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/admin/export",
        Component: ExportReports,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/admin/settings",
        Component: AdminSettings,
        ErrorBoundary: ErrorBoundary,
    },
    // Club routes
    {
        path: "/club/login",
        Component: ClubLogin,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/club/dashboard",
        Component: ClubDashboard,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/club/profile",
        Component: ClubProfile,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/club/posts",
        Component: MyPosts,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/club/posts/new",
        Component: CreatePost,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/club/posts/edit/:id",
        Component: EditPost,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/club/events",
        Component: MyEvents,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/club/events/new",
        Component: CreateEvent,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/club/events/edit/:id",
        Component: EditEvent,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/club/registrations/:id",
        Component: ViewRegistrations,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/club/followers",
        Component: Followers,
        ErrorBoundary: ErrorBoundary,
    },
    // Student routes
    {
        path: "/student/login",
        Component: StudentLogin,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/student/dashboard",
        Component: StudentDashboard,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/student/explore",
        Component: ExploreClubs,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/student/club/:id",
        Component: ClubProfileView,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/student/event/:id",
        Component: EventRegistration,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/student/settings",
        Component: NotificationSettings,
        ErrorBoundary: ErrorBoundary,
    },
    {
        path: "/student/my-events",
        Component: MyEventsStudent,
        ErrorBoundary: ErrorBoundary,
    },
    // Catch-all 404 route
    {
        path: "*",
        ErrorBoundary: ErrorBoundary,
    },
]);
