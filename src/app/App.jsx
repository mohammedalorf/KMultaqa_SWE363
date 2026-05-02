import { RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { warmApi } from "./api/apiClient";
import { router } from "./routes";

export default function App() {
  useEffect(() => {
    warmApi().catch(() => {
      // Keep backend warm-up silent; normal API calls show user-facing errors.
    });
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" duration={3500} closeButton visibleToasts={3} />
    </>
  );
}
