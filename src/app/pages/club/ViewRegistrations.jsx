import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { LayoutDashboard, User, FileText, Calendar, Users, Search, Download, } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { mockEvents } from "../../data/mockData";
import { toast } from "sonner";

const sidebarItems = [
    { label: "Dashboard", path: "/club/dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2"/> },
    { label: "Profile Settings", path: "/club/profile", icon: <User className="w-4 h-4 mr-2"/> },
    { label: "My Posts", path: "/club/posts", icon: <FileText className="w-4 h-4 mr-2"/> },
    { label: "My Events", path: "/club/events", icon: <Calendar className="w-4 h-4 mr-2"/> },
    { label: "Followers", path: "/club/followers", icon: <Users className="w-4 h-4 mr-2"/> },
];

// Mock registration data
const mockRegistrations = [
    {
        id: "1",
        studentName: "Ahmed Al-Rashid",
        studentId: "202012345",
        email: "ahmed.rashid@kfupm.edu.sa",
        registeredAt: "2024-01-15T10:30:00",
        additionalInfo: {
            "Phone Number": "+966 50 123 4567",
            "Year": "3rd Year"
        }
    },
    {
        id: "2",
        studentName: "Mohammed Al-Ghamdi",
        studentId: "202013456",
        email: "mohammed.ghamdi@kfupm.edu.sa",
        registeredAt: "2024-01-15T14:20:00",
        additionalInfo: {
            "Phone Number": "+966 55 234 5678",
            "Year": "2nd Year"
        }
    },
    {
        id: "3",
        studentName: "Khalid Al-Otaibi",
        studentId: "202014567",
        email: "khalid.otaibi@kfupm.edu.sa",
        registeredAt: "2024-01-16T09:15:00",
        additionalInfo: {
            "Phone Number": "+966 56 345 6789",
            "Year": "4th Year"
        }
    },
    {
        id: "4",
        studentName: "Abdullah Al-Mutairi",
        studentId: "202015678",
        email: "abdullah.mutairi@kfupm.edu.sa",
        registeredAt: "2024-01-16T11:45:00",
        additionalInfo: {
            "Phone Number": "+966 54 456 7890",
            "Year": "1st Year"
        }
    },
    {
        id: "5",
        studentName: "Faisal Al-Qahtani",
        studentId: "202016789",
        email: "faisal.qahtani@kfupm.edu.sa",
        registeredAt: "2024-01-17T08:30:00",
        additionalInfo: {
            "Phone Number": "+966 53 567 8901",
            "Year": "3rd Year"
        }
    },
];

export default function ViewRegistrations() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [registrations] = useState(mockRegistrations);

    useEffect(() => {
        const foundEvent = mockEvents.find(e => e.id === id);
        if (foundEvent) {
            setEvent(foundEvent);
        }
    }, [id]);

    const filteredRegistrations = registrations.filter(reg => reg.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.studentId.includes(searchQuery) ||
        reg.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleExport = () => {
        toast.success("Registration data exported successfully!");
    };

    if (!event) {
        return null;
    }

    return (<DashboardLayout role="club" userName="IEEE KFUPM Student Branch" userLogo="🔧" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/club/events" className="hover:text-foreground">My Events</Link>
            <span>/</span>
            <span>Registrations</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <p className="text-muted-foreground">
            View and manage event registrations
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary"/>
              </div>
              <div>
                <div className="text-2xl font-bold">{registrations.length}</div>
                <div className="text-sm text-muted-foreground">Total Registrations</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600"/>
              </div>
              <div>
                <div className="text-2xl font-bold">{new Date(event.date).toLocaleDateString()}</div>
                <div className="text-sm text-muted-foreground">Event Date</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions and Search */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"/>
              <Input placeholder="Search by name, ID, or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10"/>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2"/>
              Export CSV
            </Button>
          </div>
        </Card>

        {/* Registrations Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Registered At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredRegistrations.map((registration) => (<tr key={registration.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{registration.studentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {registration.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {registration.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(registration.registeredAt).toLocaleDateString()} at{" "}
                      {new Date(registration.registeredAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            })}
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>

          {filteredRegistrations.length === 0 && (<div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
              <h3 className="text-xl font-semibold mb-2">No registrations found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search criteria" : "No students have registered yet"}
              </p>
            </div>)}
        </Card>
      </div>
    </DashboardLayout>);
}