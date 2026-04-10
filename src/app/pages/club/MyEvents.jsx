import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Link } from "react-router-dom";
import { LayoutDashboard, User, FileText, Calendar, Users, Edit, Trash2, UserCheck } from "lucide-react";
import { useState } from "react";
import { mockEvents } from "../../data/mockData";
import { toast } from "sonner";

const sidebarItems = [
  { label: "Dashboard", path: "/club/dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
  { label: "Profile Settings", path: "/club/profile", icon: <User className="w-4 h-4 mr-2" /> },
  { label: "My Posts", path: "/club/posts", icon: <FileText className="w-4 h-4 mr-2" /> },
  { label: "My Events", path: "/club/events", icon: <Calendar className="w-4 h-4 mr-2" /> },
  { label: "Followers", path: "/club/followers", icon: <Users className="w-4 h-4 mr-2" /> }
];

export default function MyEvents() {
  const [events, setEvents] = useState(mockEvents.filter((e) => String(e.clubId) === "1"));
  const [eventToDelete, setEventToDelete] = useState(null);

  const confirmDelete = () => {
    if (!eventToDelete) return;
    setEvents(events.filter((e) => String(e.id) !== String(eventToDelete.id)));
    toast.success("Event deleted");
    setEventToDelete(null);
  };

  return (
    <DashboardLayout role="club" userName="IEEE KFUPM Student Branch" userLogo="🏫" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Events</h1>
            <p className="text-muted-foreground">Manage your club's events and registrations</p>
          </div>
          <Link to="/club/events/new">
            <Button>Create New Event</Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    {event.hasRegistration && <Badge variant="default">Registration Open</Badge>}
                  </div>
                  <p className="text-muted-foreground mb-3">{event.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Time:</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Location:</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-muted-foreground" />
                      <span>{event.registrations || event.attendees || 0} registered</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link to={`/club/events/edit/${event.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Link to={`/club/registrations/${event.id}`}>
                    <Button variant="outline" size="sm">
                      <UserCheck className="w-4 h-4 mr-1" />
                      View Registrations
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => setEventToDelete(event)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {events.length === 0 && (
          <Card className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">Start creating events and collecting registrations</p>
            <Link to="/club/events/new">
              <Button>Create Your First Event</Button>
            </Link>
          </Card>
        )}
      </div>

      <Dialog open={Boolean(eventToDelete)} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete event "{eventToDelete?.title}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
