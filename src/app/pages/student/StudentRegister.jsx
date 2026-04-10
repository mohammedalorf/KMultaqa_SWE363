import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

const EMAIL_REGEX = /^[^\s@]+@kfupm\.edu\.sa$/i;
const STUDENT_ID_REGEX = /^s\d{6}$/i;

export default function StudentRegister() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }

    if (!STUDENT_ID_REGEX.test(studentId)) {
      toast.error("Student ID must match format s123456.");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      toast.error("Use your university email (@kfupm.edu.sa).");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    toast.success("Account created successfully. You can now sign in.");
    navigate("/student/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-2">Student Registration</h1>
        <p className="text-muted-foreground mb-6">Create your account with KFUPM credentials</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input id="studentId" placeholder="s123456" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">University Email</Label>
            <Input id="email" type="email" placeholder="s123456@kfupm.edu.sa" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>

          <Button type="submit" className="w-full">Create Account</Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/student/login" className="text-sm text-primary hover:underline">Already have an account? Sign in</Link>
        </div>
      </Card>
    </div>
  );
}
