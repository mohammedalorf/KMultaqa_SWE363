export const ACCESS_DENIED_REASON = "access-denied";
export const ACCESS_DENIED_MESSAGE =
  "You don't have access to that area. Please log in with the correct account.";

const loginPathsByRole = {
  student: "/student/login",
  club: "/club/login",
  admin: "/admin/login",
};

export function clearAuthSession() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  localStorage.removeItem("userRole");
}

export function getLoginPathForRole(role) {
  return loginPathsByRole[role] || loginPathsByRole.student;
}

export function getStoredAuthRole() {
  const storedRole = localStorage.getItem("userRole");

  if (loginPathsByRole[storedRole]) {
    return storedRole;
  }

  try {
    const storedUser = JSON.parse(localStorage.getItem("authUser") || "null");

    if (loginPathsByRole[storedUser?.role]) {
      return storedUser.role;
    }
  } catch {
    return "";
  }

  return "";
}

export function getRoleFromPath(pathname = window.location.pathname) {
  const role = pathname.split("/").filter(Boolean)[0];
  return loginPathsByRole[role] ? role : "";
}

export function getAccessDeniedLoginUrl(role) {
  return `${getLoginPathForRole(role)}?reason=${ACCESS_DENIED_REASON}`;
}

export function getLoginNotice(location) {
  if (location?.state?.message) {
    return location.state.message;
  }

  const params = new URLSearchParams(location?.search || "");

  if (params.get("reason") === ACCESS_DENIED_REASON) {
    return ACCESS_DENIED_MESSAGE;
  }

  return "";
}
