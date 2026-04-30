import { apiClient } from "./apiClient";

export function getClubRequests() {
  return apiClient.get("/admin/club-requests");
}

export function reviewClubRequest(requestId, payload) {
  return apiClient.patch(`/admin/club-requests/${requestId}`, payload);
}

export function getAdminDashboard() {
  return apiClient.get("/admin/dashboard");
}

export function getAdminClubs({ search = "" } = {}) {
  return apiClient.get("/admin/clubs", {
    params: { search },
  });
}

export function updateAdminClubStatus(clubId, payload) {
  return apiClient.patch(`/admin/clubs/${clubId}/status`, payload);
}

export function getAdminReports({ status = "all" } = {}) {
  return apiClient.get("/admin/reports", {
    params: { status },
  });
}

export function updateAdminReport(reportId, payload) {
  return apiClient.patch(`/admin/reports/${reportId}`, payload);
}

export function getAdminAnnouncements() {
  return apiClient.get("/admin/announcements");
}

export function createAdminAnnouncement(payload) {
  return apiClient.post("/admin/announcements", payload);
}
