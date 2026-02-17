import { useEffect, useRef, useState } from "react";
import EventPopup from "./EventPopup";
import "./TimelineSlider.css";

interface TimelineSliderProps {
  startYear: number;
  endYear: number;
  currentYear: number;
  onYearChange: (year: number) => void;
  pauseYears?: Set<number>;
  eventsYear?: number;
}

function TimelineSlider({
  startYear,
  endYear,
  currentYear,
  onYearChange,
  pauseYears,
  eventsYear,
}: TimelineSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  // isEventPaused halts the interval without changing isPlaying,
  // so the pause button keeps showing ⏸ during the 5s event pause.
  const [isEventPaused, setIsEventPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x, 2x, or 4x
  const speedOptions = [1, 2, 4];
  const eventPauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearEventPauseTimer = () => {
    if (eventPauseTimerRef.current !== null) {
      clearTimeout(eventPauseTimerRef.current);
      eventPauseTimerRef.current = null;
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearEventPauseTimer();
    setIsEventPaused(false);
    onYearChange(parseInt(e.target.value));
  };

  const togglePlay = () => {
    clearEventPauseTimer();
    setIsEventPaused(false);
    if (!isPlaying && currentYear === endYear) {
      onYearChange(startYear);
    }
    setIsPlaying(!isPlaying);
  };

  const decreaseSpeed = () => {
    const currentIndex = speedOptions.indexOf(speedMultiplier);
    if (currentIndex > 0) {
      setSpeedMultiplier(speedOptions[currentIndex - 1]);
    }
  };

  const increaseSpeed = () => {
    const currentIndex = speedOptions.indexOf(speedMultiplier);
    if (currentIndex < speedOptions.length - 1) {
      setSpeedMultiplier(speedOptions[currentIndex + 1]);
    }
  };

  useEffect(() => {
    return () => clearEventPauseTimer();
  }, []);

  useEffect(() => {
    if (!isPlaying || isEventPaused) return;

    const interval = setInterval(() => {
      if (currentYear >= endYear) {
        setIsPlaying(false);
        return;
      }
      const nextYear = currentYear + 1;
      onYearChange(nextYear);
      if (pauseYears?.has(nextYear)) {
        setIsEventPaused(true);
        eventPauseTimerRef.current = setTimeout(() => {
          eventPauseTimerRef.current = null;
          setIsEventPaused(false);
        }, 5000);
      }
    }, 1000 / speedMultiplier);

    return () => clearInterval(interval);
  }, [isPlaying, isEventPaused, currentYear, endYear, onYearChange, speedMultiplier, pauseYears]);

  return (
    <div className="timeline-slider">
      {eventsYear !== undefined && <EventPopup year={eventsYear} />}
      <div className="timeline-controls">
        <button
          className="timeline-play-button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <div className="timeline-year">{currentYear}</div>
        <div className="timeline-speed-controls">
          <button
            className="timeline-speed-button"
            onClick={decreaseSpeed}
            disabled={speedMultiplier === 1}
            aria-label="Slow down"
            title="Slow down"
          >
            −
          </button>
          <span className="timeline-speed-label">{speedMultiplier}x</span>
          <button
            className="timeline-speed-button"
            onClick={increaseSpeed}
            disabled={speedMultiplier === 4}
            aria-label="Speed up"
            title="Speed up"
          >
            +
          </button>
        </div>
      </div>
      <div className="timeline-range-wrapper">
        <input
          type="range"
          min={startYear}
          max={endYear}
          value={currentYear}
          onChange={handleSliderChange}
          className="timeline-range"
        />
      </div>
      <div className="timeline-labels">
        <span>{startYear}</span>
        <span>{endYear}</span>
      </div>
    </div>
  );
}

export default TimelineSlider;
