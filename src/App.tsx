import { useState } from "react";
import WorldMap from "./WorldMap";
import BottomBar from "./BottomBar";
import TopBanner from "./TopBanner";
import MetricButtons from "./MetricButtons";
import TimelineSlider from "./TimelineSlider";
import "./App.css";

const START_YEAR = 1960;
const END_YEAR = 2024; // Most recent year with World Bank data

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Economy");
  const [selectedMetric, setSelectedMetric] = useState<string | null>("GDP");
  const [selectedYear, setSelectedYear] = useState<number>(END_YEAR);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Reset metric when category changes
    setSelectedMetric(null);
  };

  return (
    <div className="app">
      <TopBanner selectedCategory={selectedCategory} />
      <MetricButtons
        category={selectedCategory}
        selectedMetric={selectedMetric}
        onSelectMetric={setSelectedMetric}
      />
      <WorldMap selectedMetric={selectedMetric} selectedYear={selectedYear} />
      {selectedMetric && (
        <TimelineSlider
          startYear={START_YEAR}
          endYear={END_YEAR}
          currentYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      )}
      <BottomBar selectedCategory={selectedCategory} onSelectCategory={handleCategoryChange} />
    </div>
  );
}

export default App;
