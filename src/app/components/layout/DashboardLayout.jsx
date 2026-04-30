import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, Bell } from "lucide-react";
import { getNotifications, markNotificationsRead } from "../../api/notificationApi";

function normalizeSections(sidebarItems) {
  if (!Array.isArray(sidebarItems) || sidebarItems.length === 0) return [];
  const first = sidebarItems[0];
  if (first && typeof first === "object" && Array.isArray(first.items)) {
    return sidebarItems;
  }
  return [{ title: null, items: sidebarItems }];
}

function buildBreadcrumb(pathname, sections, roleLabel, roleHome) {
  const flat = sections.flatMap((s) => s.items);
  const active = flat.find((item) => item.path === pathname);
  const fallback = pathname.split("/").filter(Boolean).slice(-1)[0]?.replace(/-/g, " ") || "Dashboard";
  const currentLabel = active?.label || fallback;
  return [
    { label: roleLabel, to: roleHome },
    { label: currentLabel }
  ];
}

function SidebarContent({ sections, pathname, userName, userLogo, roleLabel, roleAccent, onLogout, onNavigate }) {
  return (
    <>
      <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
        {/* Logo header */}
        <div className="px-5 h-16 flex items-center border-b border-[var(--sidebar-border)] shrink-0">
          <Link to="/" onClick={onNavigate} className="inline-flex items-center group">
            <img
              src="/logos/logo-compact.png"
              alt="KMultaqa"
              className="h-12 w-auto object-contain group-hover:opacity-85 transition-opacity"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-5 px-3 py-5">
          {sections.map((section, sIdx) => (
            <div key={section.title || `section-${sIdx}`} className="flex flex-col gap-0.5">
              {section.title && (
                <div className="px-2.5 mb-1 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[var(--muted-foreground)]">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const active = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className={`group relative flex items-center gap-2.5 w-full h-9 px-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      active
                        ? "bg-[var(--primary)] text-white shadow-[var(--shadow-xs)]"
                        : "text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-white/60" aria-hidden />
                    )}
                    <span className={`shrink-0 ${active ? "text-white" : "text-[var(--muted-foreground)] group-hover:text-[var(--primary)]"} transition-colors`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* User footer */}
      <div className="border-t border-[var(--sidebar-border)] p-3 shrink-0">
        <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg bg-[var(--accent)]/60 mb-1">
          <div className={`w-8 h-8 rounded-full ${roleAccent} flex items-center justify-center font-semibold text-sm shrink-0 leading-none`}>
            {userLogo || userName?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-[var(--foreground)] leading-tight">{userName}</p>
            <p className="text-[11px] text-[var(--muted-foreground)] capitalize truncate mt-0.5">{roleLabel}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 h-9 px-2.5 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--destructive-soft)] hover:text-[var(--destructive)] transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </>
  );
}

export function DashboardLayout({ role, userName, userLogo, sidebarItems, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const isStudent = role === "student";

  useEffect(() => {
    setMobileOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isStudent) {
      return undefined;
    }

    let cancelled = false;

    const loadNotifications = async () => {
      setNotificationsLoading(true);

      try {
        const { data } = await getNotifications();

        if (cancelled) {
          return;
        }

        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch {
        if (!cancelled) {
          setNotifications([]);
          setUnreadCount(0);
        }
      } finally {
        if (!cancelled) {
          setNotificationsLoading(false);
        }
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isStudent]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const roleLabel =
    role === "admin" ? "Administrator" :
    role === "club" ? "Club Representative" :
    role === "student" ? "Student" : role;

  const roleHome =
    role === "admin" ? "/admin/dashboard" :
    role === "club" ? "/club/dashboard" :
    role === "student" ? "/student/dashboard" : "/";

  const roleAccent =
    role === "student"
      ? "bg-[var(--teal-soft)] text-[var(--teal)]"
      : "bg-[var(--primary-soft)] text-[var(--primary)]";

  const sections = normalizeSections(sidebarItems);
  const crumbs = buildBreadcrumb(location.pathname, sections, roleLabel, roleHome);
  const flat = sections.flatMap((s) => s.items);
  const active = flat.find((i) => i.path === location.pathname);
  const topTitle = active?.label || crumbs[crumbs.length - 1]?.label;

  const handleNotificationsClick = async () => {
    const willOpen = !notificationsOpen;
    setNotificationsOpen(willOpen);

    if (!willOpen || !isStudent || unreadCount === 0) {
      return;
    }

    setUnreadCount(0);
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));

    try {
      await markNotificationsRead();
    } catch {
      await getNotifications()
        .then(({ data }) => {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        })
        .catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] flex-col z-30">
        <SidebarContent
          sections={sections}
          pathname={location.pathname}
          userName={userName}
          userLogo={userLogo}
          roleLabel={roleLabel}
          roleAccent={roleAccent}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] flex flex-col shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--sidebar-border)] shrink-0">
              <img src="/logos/logo-compact.png" alt="KMultaqa" className="h-12 w-auto object-contain" />
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <SidebarContent
              sections={sections}
              pathname={location.pathname}
              userName={userName}
              userLogo={userLogo}
              roleLabel={roleLabel}
              roleAccent={roleAccent}
              onLogout={handleLogout}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Topbar */}
        <div className="sticky top-0 z-20 h-16 bg-[var(--card)]/95 backdrop-blur-md border-b border-[var(--border)] shadow-[var(--shadow-xs)] flex items-center px-4 sm:px-6 lg:px-8 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="flex items-center gap-1.5 text-sm min-w-0 flex-1" aria-label="Breadcrumb">
            {crumbs.map((c, idx) => {
              const last = idx === crumbs.length - 1;
              return (
                <span key={idx} className="inline-flex items-center gap-1.5 min-w-0">
                  {c.to && !last ? (
                    <Link to={c.to} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors truncate">
                      {c.label}
                    </Link>
                  ) : (
                    <span className={`truncate ${last ? "text-[var(--foreground)] font-semibold" : "text-[var(--muted-foreground)]"}`}>
                      {c.label}
                    </span>
                  )}
                  {!last && <span className="text-[var(--border)] text-lg leading-none">/</span>}
                </span>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={handleNotificationsClick}
                className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
              >
                <Bell className="w-[18px] h-[18px]" />
                {isStudent && unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[var(--destructive)] ring-2 ring-[var(--card)]" />
                )}
              </button>

              {isStudent && notificationsOpen && (
                <div className="absolute right-0 top-11 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-lg)] z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-sm font-semibold text-[var(--foreground)]">Notifications</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="px-4 py-4 text-sm text-[var(--muted-foreground)]">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-4 text-sm text-[var(--muted-foreground)]">No new notifications.</div>
                    ) : (
                      notifications.map((notification) => (
                        <div key={notification.id} className="px-4 py-3 border-b border-[var(--border)] last:border-b-0">
                          <p className="text-sm text-[var(--foreground)] leading-snug">{notification.message}</p>
                          {notification.createdAt && (
                            <p className="text-xs text-[var(--muted-foreground)] mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-full ${roleAccent} font-semibold text-sm shrink-0`}>
              {userLogo || userName?.charAt(0) || "U"}
            </div>
          </div>
        </div>

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
