import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Calendar, Clock, Edit, MapPin, Trash2, UserCheck } from "lucide-react";
import { PageContainer } from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Section } from "../../components/layout/Section";
import { EmptyState } from "../../components/layout/EmptyState";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { getApiErrorMessage } from "../../api/apiClient";
import { deleteClubEvent, getClubEvents } from "../../api/clubApi";

function formatDate(value) {
  if (!value) return "Date TBA";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "Time TBA";

  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyEventId, setBusyEventId] = useState(null);

  const loadEvents = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const { data } = await getClubEvents();
      setEvents(data.events ?? []);
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not load events.");
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    setBusyEventId(eventToDelete.id);

    try {
      await deleteClubEvent(eventToDelete.id);
      setEvents((current) => current.filter((event) => event.id !== eventToDelete.id));
      toast.success("Event deleted");
      setEventToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete event."));
    } finally {
      setBusyEventId(null);
    }
  };

  return (
    <>
      <PageContainer>
        <PageHeader
          eyebrow="Events"
          title="My Events"
          subtitle="Manage your club's events and registrations."
          actions={
            <Link to="/club/events/new">
              <Button>Create New Event</Button>
            </Link>
          }
        />

        <Section title="All Events" description="Upcoming and past events for your club.">
          {isLoading ? (
            <Card className="p-8 text-center text-sm text-[var(--muted-foreground)]">
              Loading events...
            </Card>
          ) : loadError ? (
            <EmptyState
              icon={<Calendar className="w-6 h-6" />}
              title="Could not load events"
              description={loadError}
              action={<Button onClick={loadEvents}>Try Again</Button>}
            />
          ) : events.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-6 h-6" />}
              title="No events yet"
              description="Start creating events and collecting registrations."
              action={
                <Link to="/club/events/new">
                  <Button>Create Your First Event</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4">
              {events.map((event) => (
                <Card key={event.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold">{event.title}</h3>
                        <Badge variant="default">Published</Badge>
                        {event.requiresRegistrationApproval && (
                          <Badge variant="warning">Approval Required</Badge>
                        )}
                      </div>
                      <p className="text-[var(--muted-foreground)] mb-3">{event.description}</p>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <span>{formatDate(event.startDateTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <span>{event.hasStartTime === false ? "Time TBA" : formatTime(event.startDateTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <span>{event.location || "Location TBA"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <span>
                            {event.capacity
                              ? `${event.registered} / ${event.capacity} registered`
                              : `${event.registered} registered`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
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
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setEventToDelete(event)}
                        disabled={busyEventId === event.id}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>
      </PageContainer>

      <Dialog open={Boolean(eventToDelete)} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--muted-foreground)]">
            Delete event "{eventToDelete?.title}"? It will be removed from student event lists.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={busyEventId === eventToDelete?.id}>
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
