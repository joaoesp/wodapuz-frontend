import { useState } from "react";
import "./TimelineSlider.css";

interface TimelineSliderProps {
  startYear: number;
  endYear: number;
  currentYear: number;
  onYearChange: (year: number) => void;
}

function TimelineSlider({ startYear, endYear, currentYear, onYearChange }: TimelineSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onYearChange(parseInt(e.target.value));
  };

  return (
    <div className="timeline-slider">
      <div className="timeline-year">{currentYear}</div>
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
