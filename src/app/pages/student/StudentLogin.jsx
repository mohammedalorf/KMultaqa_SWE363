import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/LoginForm";

export default function StudentLogin() {
  const navigate = useNavigate();

  return (
    <LoginForm
      title="Student Login"
      subtitle="Discover clubs and register for campus events"
      icon={Calendar}
      emailLabel="University Email"
      emailPlaceholder="s123456@kfupm.edu.sa"
      navigateTo="/student/dashboard"
      showRegister={true}
      registerText="Don't have an account?"
      registerButtonText="Register with University Email"
      onRegister={() => navigate("/student/register")}
    />
  );
}
