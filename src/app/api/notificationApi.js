import { apiClient } from "./apiClient";

export function getNotifications() {
  return apiClient.get("/notifications");
}

export function markNotificationsRead() {
  return apiClient.patch("/notifications/read");
}

export function deleteNotifications() {
  return apiClient.delete("/notifications");
}
