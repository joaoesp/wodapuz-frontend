import { useState } from "react";
import WorldMap from "./WorldMap";
import Navbar from "./Navbar";
import MetricButtons from "./MetricButtons";
import TimelineSlider from "./TimelineSlider";
import GdpLineChart from "./GdpLineChart";
import { GDP_GROWTH_EVENTS } from "./worldEvents";
import "./App.css";

const DEFAULT_START_YEAR = 1960;
const DEFAULT_END_YEAR = 2024; // Most recent year with World Bank data

// Single-year events only — animation pauses 5s on these years
const GDP_GROWTH_PAUSE_YEARS = new Set(
  GDP_GROWTH_EVENTS.filter((e) => e.startYear === e.endYear).map((e) => e.startYear)
);

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Economy");
  const [selectedMetric, setSelectedMetric] = useState<string | null>("GDP");
  const [selectedYear, setSelectedYear] = useState<number>(DEFAULT_END_YEAR);
  const [availableYearRange, setAvailableYearRange] = useState<{
    startYear: number;
    endYear: number;
  }>({
    startYear: DEFAULT_START_YEAR,
    endYear: DEFAULT_END_YEAR,
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Reset metric when category changes
    setSelectedMetric(null);
  };

  const handleYearRangeUpdate = (startYear: number, endYear: number) => {
    setAvailableYearRange({ startYear, endYear });
    // If current year is outside the new range, adjust it
    if (selectedYear < startYear) {
      setSelectedYear(startYear);
    } else if (selectedYear > endYear) {
      setSelectedYear(endYear);
    }
  };

  return (
    <div className="app">
      <MetricButtons
        category={selectedCategory}
        selectedMetric={selectedMetric}
        onSelectMetric={setSelectedMetric}
      />
      <WorldMap
        selectedMetric={selectedMetric}
        selectedYear={selectedYear}
        onYearRangeUpdate={handleYearRangeUpdate}
      />
      {selectedMetric && (
        <>
          <TimelineSlider
            startYear={availableYearRange.startYear}
            endYear={availableYearRange.endYear}
            currentYear={selectedYear}
            onYearChange={setSelectedYear}
            pauseYears={selectedMetric === "GDP growth" ? GDP_GROWTH_PAUSE_YEARS : undefined}
            eventsYear={selectedMetric === "GDP growth" ? selectedYear : undefined}
          />
          {selectedMetric === "GDP" && (
            <GdpLineChart
              startYear={availableYearRange.startYear}
              endYear={availableYearRange.endYear}
            />
          )}
        </>
      )}
      <Navbar selectedCategory={selectedCategory} onSelectCategory={handleCategoryChange} />
    </div>
  );
}

export default App;
