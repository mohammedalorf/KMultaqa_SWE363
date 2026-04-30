import { apiClient } from "./apiClient";

export function uploadImage(file, folder) {
  const formData = new FormData();
  formData.append("image", file);

  if (folder) {
    formData.append("folder", folder);
  }

  return apiClient.post("/uploads/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
