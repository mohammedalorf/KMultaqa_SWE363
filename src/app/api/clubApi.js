import { apiClient } from "./apiClient";

export function getClubDashboard() {
  return apiClient.get("/club/dashboard");
}

export function getClubProfile() {
  return apiClient.get("/club/profile");
}

export function updateClubProfile(payload) {
  return apiClient.patch("/club/profile", payload);
}

export function getClubPosts() {
  return apiClient.get("/club/posts");
}

export function createClubPost(payload) {
  return apiClient.post("/club/posts", payload);
}

export function getClubPost(postId) {
  return apiClient.get(`/club/posts/${postId}`);
}

export function updateClubPost(postId, payload) {
  return apiClient.patch(`/club/posts/${postId}`, payload);
}

export function deleteClubPost(postId) {
  return apiClient.delete(`/club/posts/${postId}`);
}

export function getClubEvents() {
  return apiClient.get("/club/events");
}

export function createClubEvent(payload) {
  return apiClient.post("/club/events", payload);
}

export function getClubEvent(eventId) {
  return apiClient.get(`/club/events/${eventId}`);
}

export function updateClubEvent(eventId, payload) {
  return apiClient.patch(`/club/events/${eventId}`, payload);
}

export function deleteClubEvent(eventId) {
  return apiClient.delete(`/club/events/${eventId}`);
}

export function getClubEventRegistrations(eventId) {
  return apiClient.get(`/club/events/${eventId}/registrations`);
}

export function getClubFollowers() {
  return apiClient.get("/club/followers");
}

export function submitClubRequest(payload) {
  return apiClient.post("/club/requests", payload);
}
