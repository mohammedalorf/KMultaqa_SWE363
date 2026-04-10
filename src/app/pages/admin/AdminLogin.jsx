import { ShieldCheck } from "lucide-react";
import LoginForm from "../../components/LoginForm";

export default function AdminLogin() {
    return (
        <LoginForm
            title="Administrator Login"
            subtitle="Access the platform administration dashboard"
            icon={ShieldCheck}
            emailPlaceholder="admin@kfupm.edu.sa"
            navigateTo="/admin/dashboard"
        />
    );
}