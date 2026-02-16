import { useEffect, useState } from "react";
import "./TimelineSlider.css";

interface TimelineSliderProps {
  startYear: number;
  endYear: number;
  currentYear: number;
  onYearChange: (year: number) => void;
}

function TimelineSlider({ startYear, endYear, currentYear, onYearChange }: TimelineSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x, 2x, or 4x
  const speedOptions = [1, 2, 4];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onYearChange(parseInt(e.target.value));
  };

  const togglePlay = () => {
    if (!isPlaying && currentYear === endYear) {
      // If at the end, restart from the beginning
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
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (currentYear >= endYear) {
        setIsPlaying(false);
        return;
      }
      onYearChange(currentYear + 1);
    }, 1000 / speedMultiplier); // 1x = 1000ms, 2x = 500ms, 4x = 250ms

    return () => clearInterval(interval);
  }, [isPlaying, currentYear, endYear, onYearChange, speedMultiplier]);

  return (
    <div className="timeline-slider">
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
      <input
        type="range"
        min={startYear}
        max={endYear}
        value={currentYear}
        onChange={handleSliderChange}
        className="timeline-range"
      />
      <div className="timeline-labels">
        <span>{startYear}</span>
        <span>{endYear}</span>
      </div>
    </div>
  );
}

export default TimelineSlider;
