import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../api/apiClient";
import { loginAccount } from "../../api/authApi";
import LoginForm from "../../components/LoginForm";

export default function AdminLogin() {
  return (
    <LoginForm
      title="Administrator Login"
      subtitle="Access the platform administration dashboard"
      icon={ShieldCheck}
      emailPlaceholder="admin@kfupm.edu.sa"
      navigateTo="/admin/dashboard"
      onLogin={async ({ email, password }) => {
        try {
          const { data } = await loginAccount({
            email: email.trim().toLowerCase(),
            password,
            role: "admin",
          });

          if (data.user?.role !== "admin") {
            toast.error("Use an administrator account to access this portal.");
            return false;
          }

          localStorage.setItem("authToken", data.token);
          localStorage.setItem("authUser", JSON.stringify(data.user));
          localStorage.setItem("userRole", data.user.role);
          toast.success(data.message || "Login successful.");
          return true;
        } catch (error) {
          toast.error(getApiErrorMessage(error, "Admin login failed."));
          return false;
        }
      }}
      role="admin"
    />
  );
}
