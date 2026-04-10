import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";

export default function LoginForm({ title, subtitle, icon: Icon, emailLabel = "Email Address", emailPlaceholder, navigateTo, backTo = "/", showRegister = false, registerText, registerButtonText, onRegister }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock login - in real app, authenticate here
        navigate(navigateTo);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/20 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
                        <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{title}</h1>
                    <p className="text-muted-foreground text-center">
                        {subtitle}
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">{emailLabel}</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={emailPlaceholder}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full">
                        Sign In
                    </Button>
                </form>

                <div className="mt-4 text-center">
                    <a href="#" className="text-sm text-primary hover:underline">
                        Forgot password?
                    </a>
                </div>

                {showRegister && (
                    <div className="mt-6 pt-6 border-t border-border text-center">
                        <p className="text-sm text-muted-foreground mb-2">{registerText}</p>
                        <Button variant="outline" className="w-full" onClick={onRegister}>
                            {registerButtonText}
                        </Button>
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                    <Link to={backTo}>
                        <Button variant="ghost" className="w-full">
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}