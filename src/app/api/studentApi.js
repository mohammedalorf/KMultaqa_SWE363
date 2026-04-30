import { apiClient } from "./apiClient";

export function getStudentDashboard() {
  return apiClient.get("/student/dashboard");
}

export function getStudentClubs({ search = "", category = "all" } = {}) {
  return apiClient.get("/student/clubs", {
    params: {
      search,
      category,
    },
  });
}

export function getStudentClubProfile(clubId) {
  return apiClient.get(`/student/clubs/${clubId}`);
}

export function likeStudentPost(postId) {
  return apiClient.post(`/student/posts/${postId}/like`);
}

export function unlikeStudentPost(postId) {
  return apiClient.delete(`/student/posts/${postId}/like`);
}

export function followStudentClub(clubId) {
  return apiClient.post(`/student/clubs/${clubId}/follow`);
}

export function unfollowStudentClub(clubId) {
  return apiClient.delete(`/student/clubs/${clubId}/follow`);
}

export function getStudentEvent(eventId) {
  return apiClient.get(`/student/events/${eventId}`);
}

export function registerForStudentEvent(eventId, answers) {
  return apiClient.post(`/student/events/${eventId}/register`, {
    answers,
  });
}

export function getStudentEventRegistrations() {
  return apiClient.get("/student/events/registrations");
}

export function cancelStudentEventRegistration(eventId) {
  return apiClient.delete(`/student/events/${eventId}/registration`);
}

export function getStudentSettings() {
  return apiClient.get("/student/settings");
}

export function updateStudentSettings(payload) {
  return apiClient.patch("/student/settings", payload);
}

export function submitStudentReport(payload) {
  return apiClient.post("/student/reports", payload);
}
