const STORAGE_KEY = "studentRegisteredEvents";

const DEFAULT_REGISTERED_EVENTS = [
  {
    id: "1",
    title: "AI & Machine Learning Workshop",
    club: "Computer Science Club",
    clubLogo: "💻",
    date: "2026-05-25",
    time: "2:00 PM - 5:00 PM",
    location: "Building 22, Room 201",
    capacity: 50,
    registered: 45,
    status: "upcoming",
    thumbnail: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=300&fit=crop"
  },
  {
    id: "2",
    title: "Annual Tech Exhibition",
    club: "Engineering Society",
    clubLogo: "⚙️",
    date: "2026-05-28",
    time: "10:00 AM - 4:00 PM",
    location: "Main Hall",
    capacity: 200,
    registered: 156,
    status: "upcoming",
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop"
  },
  {
    id: "3",
    title: "Leadership Summit",
    club: "Business Club",
    clubLogo: "💼",
    date: "2026-06-05",
    time: "9:00 AM - 3:00 PM",
    location: "Conference Center",
    capacity: 100,
    registered: 87,
    status: "upcoming",
    thumbnail: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop"
  },
  {
    id: "4",
    title: "Basketball Tournament Finals",
    club: "Sports Club",
    clubLogo: "⚽",
    date: "2026-02-15",
    time: "5:00 PM - 8:00 PM",
    location: "Sports Complex",
    capacity: 300,
    registered: 245,
    status: "past",
    thumbnail: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop"
  }
];

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function cloneDefaultEvents() {
  return DEFAULT_REGISTERED_EVENTS.map((event) => ({ ...event }));
}

function readStoredEvents() {
  if (!canUseStorage()) {
    return cloneDefaultEvents();
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    const defaultEvents = cloneDefaultEvents();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEvents));
    return defaultEvents;
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : cloneDefaultEvents();
  } catch {
    const defaultEvents = cloneDefaultEvents();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEvents));
    return defaultEvents;
  }
}

function writeStoredEvents(events) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function getEventStatus(date) {
  if (!date) {
    return "upcoming";
  }

  return new Date(date).getTime() < Date.now() ? "past" : "upcoming";
}

export function getRegisteredStudentEvents() {
  return readStoredEvents();
}

export function getRegisteredStudentEventById(eventId) {
  return readStoredEvents().find((event) => String(event.id) === String(eventId)) || null;
}

export function isStudentRegisteredForEvent(eventId) {
  return readStoredEvents().some((event) => String(event.id) === String(eventId));
}

export function cancelStudentRegistration(eventId) {
  const currentEvents = readStoredEvents();
  const nextEvents = currentEvents.filter((event) => String(event.id) !== String(eventId));
  writeStoredEvents(nextEvents);
  return nextEvents;
}

export function registerStudentEvent(event) {
  const currentEvents = readStoredEvents();
  const normalizedId = String(event.id);

  if (currentEvents.some((registeredEvent) => String(registeredEvent.id) === normalizedId)) {
    return false;
  }

  const nextEvents = [
    {
      id: normalizedId,
      title: event.title,
      club: event.clubName || event.club || "Club Event",
      clubLogo: event.clubLogo || "📅",
      date: event.date,
      time: event.time,
      location: event.location,
      capacity: event.maxAttendees || event.capacity || 0,
      registered: event.attendees || event.registered || 0,
      status: getEventStatus(event.date),
      thumbnail: event.image || event.thumbnail || "/api/placeholder/400/200"
    },
    ...currentEvents
  ];

  writeStoredEvents(nextEvents);
  return true;
}
