import { useState } from "react";
import WorldMap from "./WorldMap";
import Navbar from "./Navbar";
import MetricButtons from "./MetricButtons";
import TimelineSlider from "./TimelineSlider";
import GdpLineChart from "./GdpLineChart";
import GdpPerCapitaLineChart from "./GdpPerCapitaLineChart";
import DebtToGdpLineChart from "./DebtToGdpLineChart";
import CurrentAccountBalanceLineChart from "./CurrentAccountBalanceLineChart";
import CountryDashboard from "./CountryDashboard";
import ActivePersonnelCompare from "./ActivePersonnelCompare";
import TradeDashboard from "./TradeDashboard";
import MilitaryInventoryDashboard from "./MilitaryInventoryDashboard";
import MilitaryInventoryCompare from "./MilitaryInventoryCompare";
import { GDP_GROWTH_EVENTS } from "./worldEvents";
import "./App.css";

const DEFAULT_START_YEAR = 1960;
const DEFAULT_END_YEAR = 2024; // Most recent year with World Bank data

// Single-year events only — animation pauses 5s on these years
const GDP_GROWTH_PAUSE_YEARS = new Set(
  GDP_GROWTH_EVENTS.filter((e) => e.startYear === e.endYear).map((e) => e.startYear)
);

// Metrics that show the economy country dashboard on click
const DASHBOARD_METRICS = new Set([
  "GDP per capita",
  "Inflation",
  "Current Account Balance",
  "Military Spending",
  "Active Personnel",
]);

// Metrics with no historical data — hide the timeline slider
const HIDDEN_SLIDER_METRICS = new Set(["Military Inventory"]);

// Military inventory gets its own dashboard
const MILITARY_INVENTORY_METRICS = new Set(["Military Inventory"]);

// Trade metrics that show the trade dashboard on click
const TRADE_DASHBOARD_METRICS = new Set(["Trade Openness", "Exports", "Imports", "Trade Balance"]);

// Metrics that have a historical line chart (inside the shared chart-modal-overlay)
const CHART_METRICS = new Set(["GDP", "GDP per capita", "Debt-to-GDP", "Current Account Balance"]);

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Economy");
  const [selectedMetric, setSelectedMetric] = useState<string | null>("GDP");
  const [showChart, setShowChart] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(DEFAULT_END_YEAR);
  const [availableYearRange, setAvailableYearRange] = useState<{
    startYear: number;
    endYear: number;
  }>({
    startYear: DEFAULT_START_YEAR,
    endYear: DEFAULT_END_YEAR,
  });
  const [selectedCountry, setSelectedCountry] = useState<{
    code: string;
    name: string;
    data: { year: number; value: number }[];
  } | null>(null);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedMetric(null);
    setShowChart(false);
  };

  const handleSelectMetric = (metric: string) => {
    if (metric !== selectedMetric) setShowChart(false);
    setSelectedMetric(metric);
  };

  const handleYearRangeUpdate = (startYear: number, endYear: number) => {
    setAvailableYearRange({ startYear, endYear });
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
        onSelectMetric={handleSelectMetric}
        showChart={showChart}
        onToggleChart={() => setShowChart((v) => !v)}
      />
      <WorldMap
        selectedMetric={selectedMetric}
        selectedYear={selectedYear}
        onYearRangeUpdate={handleYearRangeUpdate}
        onCountryClick={
          selectedMetric &&
          (DASHBOARD_METRICS.has(selectedMetric) ||
            TRADE_DASHBOARD_METRICS.has(selectedMetric) ||
            MILITARY_INVENTORY_METRICS.has(selectedMetric))
            ? (code, name, data) => setSelectedCountry({ code, name, data })
            : undefined
        }
      />
      {selectedMetric && !HIDDEN_SLIDER_METRICS.has(selectedMetric) && (
        <TimelineSlider
          startYear={availableYearRange.startYear}
          endYear={availableYearRange.endYear}
          currentYear={selectedYear}
          onYearChange={setSelectedYear}
          pauseYears={selectedMetric === "GDP growth" ? GDP_GROWTH_PAUSE_YEARS : undefined}
          eventsYear={selectedMetric === "GDP growth" ? selectedYear : undefined}
        />
      )}
      {showChart && selectedMetric && CHART_METRICS.has(selectedMetric) && (
        <div className="chart-modal-overlay" onClick={() => setShowChart(false)}>
          <div className="chart-modal-content" onClick={(e) => e.stopPropagation()}>
            {selectedMetric === "GDP" && (
              <GdpLineChart
                startYear={availableYearRange.startYear}
                endYear={availableYearRange.endYear}
                onClose={() => setShowChart(false)}
              />
            )}
            {selectedMetric === "GDP per capita" && (
              <GdpPerCapitaLineChart
                startYear={availableYearRange.startYear}
                endYear={availableYearRange.endYear}
                onClose={() => setShowChart(false)}
              />
            )}
            {selectedMetric === "Debt-to-GDP" && (
              <DebtToGdpLineChart
                startYear={availableYearRange.startYear}
                endYear={availableYearRange.endYear}
                onClose={() => setShowChart(false)}
              />
            )}
            {selectedMetric === "Current Account Balance" && (
              <CurrentAccountBalanceLineChart
                startYear={availableYearRange.startYear}
                endYear={availableYearRange.endYear}
                onClose={() => setShowChart(false)}
              />
            )}
          </div>
        </div>
      )}
      {showChart && selectedMetric === "Active Personnel" && (
        <ActivePersonnelCompare onClose={() => setShowChart(false)} />
      )}
      <Navbar selectedCategory={selectedCategory} onSelectCategory={handleCategoryChange} />
      {selectedCountry && selectedMetric && DASHBOARD_METRICS.has(selectedMetric) && (
        <CountryDashboard
          countryCode={selectedCountry.code}
          countryName={selectedCountry.name}
          metric={selectedMetric}
          data={selectedCountry.data}
          onClose={() => setSelectedCountry(null)}
        />
      )}
      {selectedCountry && selectedMetric && TRADE_DASHBOARD_METRICS.has(selectedMetric) && (
        <TradeDashboard
          countryCode={selectedCountry.code}
          countryName={selectedCountry.name}
          year={selectedYear}
          onClose={() => setSelectedCountry(null)}
        />
      )}
      {selectedCountry && selectedMetric && MILITARY_INVENTORY_METRICS.has(selectedMetric) && (
        <MilitaryInventoryDashboard
          countryCode={selectedCountry.code}
          countryName={selectedCountry.name}
          onClose={() => setSelectedCountry(null)}
        />
      )}
      {showChart && selectedMetric === "Military Inventory" && (
        <MilitaryInventoryCompare onClose={() => setShowChart(false)} />
      )}
    </div>
  );
}

export default App;
