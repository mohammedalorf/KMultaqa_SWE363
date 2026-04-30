import { apiClient } from "./apiClient";

export function registerStudent({ name, studentId, email, password }) {
  return apiClient.post("/auth/register", {
    name,
    studentId,
    email,
    password,
    role: "student",
  });
}

export function loginStudent({ email, password }) {
  return loginAccount({ email, password, role: "student" });
}

export function loginAccount({ email, password, role }) {
  return apiClient.post("/auth/login", {
    email,
    password,
    role,
  });
}

export function verifyStudentEmail({ code }) {
  return apiClient.post("/auth/verify-email", {
    code,
  });
}

export function resendStudentVerification({ email }) {
  return apiClient.post("/auth/resend-verification", {
    email,
  });
}

export function getCurrentUser() {
  return apiClient.get("/auth/me");
}

export function getClubPasswordSetup(token) {
  return apiClient.get(`/auth/club/setup-password/${token}`);
}

export function setupClubPassword({ token, password }) {
  return apiClient.post("/auth/club/setup-password", {
    token,
    password,
  });
}
