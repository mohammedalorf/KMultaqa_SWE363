import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Search, Users, X } from "lucide-react";
import { toast } from "sonner";

import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { Toolbar, ToolbarGroup } from "../../components/layout/Toolbar";
import { EmptyState } from "../../components/layout/EmptyState";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { getApiErrorMessage } from "../../api/apiClient";
import { cancelStudentEventRegistration, getStudentEventRegistrations } from "../../api/studentApi";

function ClubAvatar({ logoUrl, name }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="w-10 h-10 rounded-full object-cover border border-[var(--border)] bg-[var(--accent)]"
      />
    );
  }

  return (
    <div className="w-10 h-10 bg-[var(--primary-soft)] text-[var(--primary)] rounded-full flex items-center justify-center text-sm font-semibold">
      {name?.charAt(0)?.toUpperCase() || "C"}
    </div>
  );
}

function EventImage({ imageUrl, title }) {
  if (imageUrl) {
    return <img src={imageUrl} alt={title} className="w-full md:w-64 h-48 object-cover" />;
  }

  return (
    <div className="w-full md:w-64 h-48 bg-[var(--accent)] flex items-center justify-center text-[var(--muted-foreground)]">
      <Calendar className="w-10 h-10" />
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Date TBA";
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatTimeRange(start, end) {
  if (!start) return "Time TBA";

  const startText = new Date(start).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const endText = end
    ? new Date(end).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return endText ? `${startText} - ${endText}` : startText;
}

export default function MyEvents() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [cancellingEventId, setCancellingEventId] = useState("");

  const loadEvents = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const { data } = await getStudentEventRegistrations();
      setEvents(data.events ?? []);
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not load your events.");
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return events.filter((event) => {
      const matchesFilter = filter === "all" || event.status === filter;
      const matchesSearch =
        event.title.toLowerCase().includes(normalizedQuery) ||
        event.club.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [events, filter, searchQuery]);

  const handleCancelRegistration = async (eventId, eventTitle) => {
    setCancellingEventId(eventId);

    try {
      const { data } = await cancelStudentEventRegistration(eventId);
      setEvents((currentEvents) => currentEvents.filter((event) => event.id !== eventId));
      toast.success(data.message || `Registration cancelled for "${eventTitle}"`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not cancel registration."));
    } finally {
      setCancellingEventId("");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="default">Upcoming</Badge>;
      case "past":
        return <Badge variant="secondary">Past</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Personal"
        title="My Events"
        subtitle="View and manage your registered events"
      />

      <Toolbar>
        <ToolbarGroup>
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            All Events
          </Button>
          <Button variant={filter === "upcoming" ? "default" : "outline"} onClick={() => setFilter("upcoming")}>
            Upcoming
          </Button>
          <Button variant={filter === "past" ? "default" : "outline"} onClick={() => setFilter("past")}>
            Past
          </Button>
        </ToolbarGroup>

        <ToolbarGroup>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent text-sm"
            />
          </div>
        </ToolbarGroup>
      </Toolbar>

      <Section>
        {isLoading ? (
          <Card className="p-8 text-center text-sm text-[var(--muted-foreground)]">
            Loading your events...
          </Card>
        ) : loadError ? (
          <EmptyState
            icon={<Calendar className="w-6 h-6" />}
            title="Could not load events"
            description={loadError}
            action={<Button onClick={loadEvents}>Try Again</Button>}
          />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-6 h-6" />}
            title="No events found"
            description={searchQuery ? "Try adjusting your search terms" : "You haven't registered for any events yet"}
            action={
              <Link to="/student/dashboard">
                <Button>
                  <Search className="w-4 h-4 mr-2" />
                  Browse Feed
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row">
                  <EventImage imageUrl={event.imageUrl} title={event.title} />
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <ClubAvatar logoUrl={event.clubLogoUrl} name={event.club} />
                        <div>
                          <h3 className="text-xl font-semibold">{event.title}</h3>
                          <p className="text-sm text-[var(--muted-foreground)]">{event.club}</p>
                        </div>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center text-sm text-[var(--muted-foreground)]">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(event.startDateTime)}</span>
                      </div>
                      <div className="flex items-center text-sm text-[var(--muted-foreground)]">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatTimeRange(event.startDateTime, event.endDateTime)}</span>
                      </div>
                      <div className="flex items-center text-sm text-[var(--muted-foreground)]">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location || "Location TBA"}</span>
                      </div>
                      <div className="flex items-center text-sm text-[var(--muted-foreground)]">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{event.capacity ? `${event.capacity} capacity` : "Open capacity"}</span>
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
                          disabled={cancellingEventId === event.id}
                          className="text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive-soft)]"
                        >
                          <X className="w-4 h-4 mr-1" />
                          {cancellingEventId === event.id ? "Cancelling..." : "Cancel Registration"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </PageContainer>
  );
}
