import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Settings, Calendar, Clock, MapPin, Users, X, Rss } from "lucide-react";
import { toast } from "sonner";

import { StudentLayout } from "../../components/layout/StudentLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { cancelStudentRegistration, getRegisteredStudentEvents } from "../../utils/studentEventRegistration";

const navItems = [
  { label: "Feed", path: "/student/dashboard", icon: <Rss className="w-4 h-4" /> },
  { label: "Explore Clubs", path: "/student/explore", icon: <Search className="w-4 h-4" /> },
  { label: "My Events", path: "/student/my-events", icon: <Calendar className="w-4 h-4" /> },
  { label: "Settings", path: "/student/settings", icon: <Settings className="w-4 h-4" /> }
];

export default function MyEvents() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState(() => getRegisteredStudentEvents());

  const filteredEvents = events.filter((event) => {
    const matchesFilter = filter === "all" || event.status === filter;
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch =
      event.title.toLowerCase().includes(normalizedQuery) ||
      event.club.toLowerCase().includes(normalizedQuery);

    return matchesFilter && matchesSearch;
  });

  const handleCancelRegistration = (eventId, eventTitle) => {
    const nextEvents = cancelStudentRegistration(eventId);
    setEvents(nextEvents);
    toast.success(`Registration cancelled for "${eventTitle}"`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Upcoming</Badge>;
      case "past":
        return <Badge variant="secondary">Past</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <StudentLayout userName="Ahmed Al-Qahtani" navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Events</h1>
          <p className="text-muted-foreground">View and manage your registered events</p>
        </div>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
                All Events
              </Button>
              <Button variant={filter === "upcoming" ? "default" : "outline"} onClick={() => setFilter("upcoming")}>
                Upcoming
              </Button>
              <Button variant={filter === "past" ? "default" : "outline"} onClick={() => setFilter("past")}>
                Past
              </Button>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
              />
            </div>
          </div>
        </Card>

        {filteredEvents.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try adjusting your search terms" : "You haven't registered for any events yet"}
            </p>
            <Link to="/student/explore">
              <Button>
                <Search className="w-4 h-4 mr-2" />
                Explore Events
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row">
                  <img src={event.thumbnail} alt={event.title} className="w-full md:w-64 h-48 object-cover" />
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-2xl">
                          {event.clubLogo}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">{event.club}</p>
                        </div>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric"
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        <span>
                          {event.registered} / {event.capacity} attendees
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link to={`/student/event/${event.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      {event.status === "upcoming" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelRegistration(event.id, event.title)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel Registration
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
