import { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { LayoutDashboard, User, FileText, Calendar, Users, Search } from "lucide-react";

const sidebarItems = [
    { label: "Dashboard", path: "/club/dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2"/> },
    { label: "Profile Settings", path: "/club/profile", icon: <User className="w-4 h-4 mr-2"/> },
    { label: "My Posts", path: "/club/posts", icon: <FileText className="w-4 h-4 mr-2"/> },
    { label: "My Events", path: "/club/events", icon: <Calendar className="w-4 h-4 mr-2"/> },
    { label: "Followers", path: "/club/followers", icon: <Users className="w-4 h-4 mr-2"/> },
];

const mockFollowers = [
    {
        id: "1",
        name: "Ahmed Al-Qahtani",
        email: "ahmed.qahtani@kfupm.edu.sa",
        studentId: "202012345",
        avatar: "👨‍🎓",
        joinedDate: "2024-01-15",
        eventsAttended: 8,
        isActive: true,
    },
    {
        id: "2",
        name: "Mohammed Al-Ghamdi",
        email: "mohammed.ghamdi@kfupm.edu.sa",
        studentId: "202011234",
        avatar: "👨‍💼",
        joinedDate: "2024-01-20",
        eventsAttended: 5,
        isActive: true,
    },
    {
        id: "3",
        name: "Faisal Al-Otaibi",
        email: "faisal.otaibi@kfupm.edu.sa",
        studentId: "202013456",
        avatar: "👨‍🔬",
        joinedDate: "2024-02-01",
        eventsAttended: 12,
        isActive: true,
    },
    {
        id: "4",
        name: "Khalid Al-Shehri",
        email: "khalid.shehri@kfupm.edu.sa",
        studentId: "202014567",
        avatar: "👨‍💻",
        joinedDate: "2024-02-10",
        eventsAttended: 3,
        isActive: true,
    },
    {
        id: "5",
        name: "Abdullah Al-Mutairi",
        email: "abdullah.mutairi@kfupm.edu.sa",
        studentId: "202015678",
        avatar: "👨‍🎨",
        joinedDate: "2024-02-15",
        eventsAttended: 6,
        isActive: false,
    },
    {
        id: "6",
        name: "Saud Al-Dawsari",
        email: "saud.dawsari@kfupm.edu.sa",
        studentId: "202016789",
        avatar: "👨‍🏫",
        joinedDate: "2024-03-01",
        eventsAttended: 2,
        isActive: true,
    },
];

export default function Followers() {
    const [searchQuery, setSearchQuery] = useState("");
    const filteredFollowers = mockFollowers.filter(follower => {
        const matchesSearch = follower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            follower.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            follower.studentId.includes(searchQuery);
        return matchesSearch;
    });
    const totalFollowers = mockFollowers.length;
    const totalEventsAttended = mockFollowers.reduce((sum, f) => sum + f.eventsAttended, 0);

    return (<DashboardLayout role="club" userName="Computer Science Club" userLogo="💻" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Followers</h1>
          <p className="text-muted-foreground">
            View and manage your club followers
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
                <div className="text-2xl font-bold">{totalFollowers}</div>
                <div className="text-sm text-muted-foreground">Total Followers</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600"/>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalEventsAttended}</div>
                <div className="text-sm text-muted-foreground">Total Event Attendances</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"/>
              <input type="text" placeholder="Search followers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"/>
            </div>
          </div>
        </Card>

        {/* Followers List */}
        {filteredFollowers.length === 0 ? (<Card className="p-12 text-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground"/>
            </div>
            <h3 className="text-xl font-semibold mb-2">No followers found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search terms" : "No followers match the selected filter"}
            </p>
          </Card>) : (<Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent">
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
                      Joined Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Events Attended
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredFollowers.map((follower) => (<tr key={follower.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-2xl mr-3">
                            {follower.avatar}
                          </div>
                          <div className="font-medium">{follower.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {follower.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {follower.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(follower.joinedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge variant="secondary">{follower.eventsAttended}</Badge>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </Card>)}
      </div>
    </DashboardLayout>);
}