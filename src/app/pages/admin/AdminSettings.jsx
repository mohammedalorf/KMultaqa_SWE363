import { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { LayoutDashboard, Shield, Flag, Building2, Megaphone, Scale, FileText, Settings, Bell, Lock, Globe, Save, } from "lucide-react";
import { toast } from "sonner";

const sidebarItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2"/> },
    { label: "Club Approvals", path: "/admin/club-approvals", icon: <Shield className="w-4 h-4 mr-2"/> },
    { label: "Reports & Moderation", path: "/admin/reports", icon: <Flag className="w-4 h-4 mr-2"/> },
    { label: "Club Management", path: "/admin/club-management", icon: <Building2 className="w-4 h-4 mr-2"/> },
    { label: "Announcements", path: "/admin/announcements", icon: <Megaphone className="w-4 h-4 mr-2"/> },
    { label: "Appeals", path: "/admin/appeals", icon: <Scale className="w-4 h-4 mr-2"/> },
    { label: "Export Reports", path: "/admin/export", icon: <FileText className="w-4 h-4 mr-2"/> },
    { label: "Settings", path: "/admin/settings", icon: <Settings className="w-4 h-4 mr-2"/> },
];

export default function AdminSettings() {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('adminSettings');
        return saved ? JSON.parse(saved) : {
            // General Settings
            platformName: "KFUPM Clubs Platform",
            platformDescription: "Official clubs and events management system for KFUPM",
            maintenanceMode: false,
            // Notification Settings
            emailNotifications: true,
            pushNotifications: true,
            weeklyDigest: true,
            // Club Settings
            autoApprovalEnabled: false,
            minFollowersForVerification: 50,
            maxEventsPerMonth: 10,
            // Moderation Settings
            autoModeration: true,
            reportThreshold: 3,
            contentFilterEnabled: true,
            // Security Settings
            twoFactorAuth: false,
            sessionTimeout: 30,
            passwordExpiry: 90,
        };
    });

    const handleSaveSettings = () => {
        localStorage.setItem('adminSettings', JSON.stringify(settings));
        toast.success("Settings saved successfully");
    };

    const handleToggle = (key) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleInputChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <DashboardLayout role="admin" userName="Admin User" sidebarItems={sidebarItems}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
                        <p className="text-muted-foreground">
                            Configure platform preferences and policies
                        </p>
                    </div>
                    <Button onClick={handleSaveSettings}>
                        <Save className="w-4 h-4 mr-2"/>
                        Save Changes
                    </Button>
                </div>

                {/* General Settings */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Globe className="w-5 h-5 text-primary"/>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">General Settings</h2>
                            <p className="text-sm text-muted-foreground">Platform-wide configuration</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Platform Name</label>
                            <input
                                type="text"
                                value={settings.platformName}
                                onChange={(e) => handleInputChange("platformName", e.target.value)}
                                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Platform Description</label>
                            <textarea
                                value={settings.platformDescription}
                                onChange={(e) => handleInputChange("platformDescription", e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                            <div>
                                <div className="font-medium">Maintenance Mode</div>
                                <div className="text-sm text-muted-foreground">Temporarily disable the platform for maintenance</div>
                            </div>
                            <Switch checked={settings.maintenanceMode} onCheckedChange={() => handleToggle("maintenanceMode")} />
                        </div>
                    </div>
                </Card>

                {/* Notification Settings */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <Bell className="w-5 h-5 text-blue-600"/>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Notification Settings</h2>
                            <p className="text-sm text-muted-foreground">Configure notification preferences</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                            <div>
                                <div className="font-medium">Email Notifications</div>
                                <div className="text-sm text-muted-foreground">Send notifications via email</div>
                            </div>
                            <Switch checked={settings.emailNotifications} onCheckedChange={() => handleToggle("emailNotifications")} />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                            <div>
                                <div className="font-medium">Push Notifications</div>
                                <div className="text-sm text-muted-foreground">Enable browser push notifications</div>
                            </div>
                            <Switch checked={settings.pushNotifications} onCheckedChange={() => handleToggle("pushNotifications")} />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                            <div>
                                <div className="font-medium">Weekly Digest</div>
                                <div className="text-sm text-muted-foreground">Send weekly summary emails to users</div>
                            </div>
                            <Switch checked={settings.weeklyDigest} onCheckedChange={() => handleToggle("weeklyDigest")} />
                        </div>
                    </div>
                </Card>

                {/* Club Settings */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-purple-600"/>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Club Settings</h2>
                            <p className="text-sm text-muted-foreground">Configure club policies and limits</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                            <div>
                                <div className="font-medium">Auto Approval</div>
                                <div className="text-sm text-muted-foreground">Automatically approve new club registrations</div>
                            </div>
                            <Switch checked={settings.autoApprovalEnabled} onCheckedChange={() => handleToggle("autoApprovalEnabled")} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Minimum Followers for Verification</label>
                            <input
                                type="number"
                                value={settings.minFollowersForVerification}
                                onChange={(e) => handleInputChange("minFollowersForVerification", parseInt(e.target.value))}
                                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Minimum followers required for verified badge</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Maximum Events Per Month</label>
                            <input
                                type="number"
                                value={settings.maxEventsPerMonth}
                                onChange={(e) => handleInputChange("maxEventsPerMonth", parseInt(e.target.value))}
                                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Maximum events a club can create per month</p>
                        </div>
                    </div>
                </Card>

                {/* Moderation Settings */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-orange-600"/>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Moderation Settings</h2>
                            <p className="text-sm text-muted-foreground">Configure content moderation policies</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                            <div>
                                <div className="font-medium">Auto Moderation</div>
                                <div className="text-sm text-muted-foreground">Automatically flag inappropriate content</div>
                            </div>
                            <Switch checked={settings.autoModeration} onCheckedChange={() => handleToggle("autoModeration")} />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                            <div>
                                <div className="font-medium">Content Filter</div>
                                <div className="text-sm text-muted-foreground">Filter inappropriate words and phrases</div>
                            </div>
                            <Switch checked={settings.contentFilterEnabled} onCheckedChange={() => handleToggle("contentFilterEnabled")} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Report Threshold</label>
                            <input
                                type="number"
                                value={settings.reportThreshold}
                                onChange={(e) => handleInputChange("reportThreshold", parseInt(e.target.value))}
                                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Number of reports before auto-flagging content</p>
                        </div>
                    </div>
                </Card>

                {/* Security Settings */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                            <Lock className="w-5 h-5 text-red-600"/>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Security Settings</h2>
                            <p className="text-sm text-muted-foreground">Configure security and authentication policies</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                            <div>
                                <div className="font-medium">Two-Factor Authentication</div>
                                <div className="text-sm text-muted-foreground">Require 2FA for admin accounts</div>
                            </div>
                            <Switch checked={settings.twoFactorAuth} onCheckedChange={() => handleToggle("twoFactorAuth")} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                            <input
                                type="number"
                                value={settings.sessionTimeout}
                                onChange={(e) => handleInputChange("sessionTimeout", parseInt(e.target.value))}
                                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Automatic logout after inactivity</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password Expiry (days)</label>
                            <input
                                type="number"
                                value={settings.passwordExpiry}
                                onChange={(e) => handleInputChange("passwordExpiry", parseInt(e.target.value))}
                                className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Force password change after specified days</p>
                        </div>
                    </div>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSaveSettings} size="lg">
                        <Save className="w-4 h-4 mr-2"/>
                        Save All Settings
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}