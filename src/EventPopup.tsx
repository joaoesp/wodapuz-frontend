import { useMemo } from "react";
import { getEventsForYear } from "./worldEvents";
import "./EventPopup.css";

interface EventPopupProps {
  year: number;
}

function EventPopup({ year }: EventPopupProps) {
  const events = useMemo(() => getEventsForYear(year), [year]);
  const hasEvents = events.length > 0;

  return (
    <div className={`event-popup ${hasEvents ? "event-popup--visible" : ""}`}>
      {events.map((event) => (
        <div key={event.label} className="event-popup-card">
          <span className="event-popup-year">{event.yearLabel}</span>
          <span className="event-popup-label">{event.label}</span>
        </div>
      ))}
    </div>
  );
}

export default EventPopup;
