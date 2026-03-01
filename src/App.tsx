import { useCallback, useEffect, useState } from "react";
import WorldMap from "./WorldMap";
import Navbar from "./Navbar";
import MetricButtons from "./MetricButtons";
import TimelineSlider from "./TimelineSlider";
import InfrastructureToggle from "./InfrastructureToggle";
import { INFRA_CONFIGS, type InfraType } from "./infraConfig";
import GdpLineChart from "./GdpLineChart";
import GdpPerCapitaLineChart from "./GdpPerCapitaLineChart";
import DebtToGdpLineChart from "./DebtToGdpLineChart";
import CurrentAccountBalanceLineChart from "./CurrentAccountBalanceLineChart";
import CountryDashboard from "./CountryDashboard";
import ActivePersonnelCompare from "./ActivePersonnelCompare";
import TradeDashboard from "./TradeDashboard";
import MilitaryInventoryDashboard from "./MilitaryInventoryDashboard";
import MilitaryInventoryCompare from "./MilitaryInventoryCompare";
import NuclearWarheadsCompare from "./NuclearWarheadsCompare";
import AllianceDashboard from "./AllianceDashboard";
import EnergyProductionDashboard from "./EnergyProductionDashboard";
import EnergyProductionLineChart from "./EnergyProductionLineChart";
import EnergyConsumptionDashboard from "./EnergyConsumptionDashboard";
import EnergyConsumptionLineChart from "./EnergyConsumptionLineChart";
import NetEnergyBalanceLineChart from "./NetEnergyBalanceLineChart";
import NetEnergyBalanceDashboard from "./NetEnergyBalanceDashboard";
import InfrastructureDashboard from "./InfrastructureDashboard";
import ReservesToggle from "./ReservesToggle";
import ReservesDashboard from "./ReservesDashboard";
import type { ReserveType } from "./reserveConfig";
import MineralsToggle from "./MineralsToggle";
import MineralsDashboard from "./MineralsDashboard";
import type { MineralType, MineralView } from "./mineralConfig";
import AgricultureToggle from "./AgricultureToggle";
import AgricultureDashboard from "./AgricultureDashboard";
import ResourceLineChart from "./ResourceLineChart";
import type { CropType } from "./agricultureConfig";
import { GDP_GROWTH_EVENTS } from "./worldEvents";
import "./App.css";

function getInfoDismissedCookie(): boolean {
  return document.cookie.split("; ").some((c) => c === "info_dismissed=1");
}

function setInfoDismissedCookie(): void {
  document.cookie = "info_dismissed=1; max-age=31536000; path=/";
}

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
const HIDDEN_SLIDER_METRICS = new Set([
  "Military Inventory",
  "Nuclear Capability",
  "Military Alliances",
  "Energy Infrastructure",
  "Energy Resources",
  "Critical Minerals",
]);

// Military inventory gets its own dashboard
const MILITARY_INVENTORY_METRICS = new Set(["Military Inventory"]);

// Alliance metric triggers the alliance dashboard on click
const ALLIANCE_METRICS = new Set(["Military Alliances"]);

// Energy metrics that show an energy dashboard on click
const ENERGY_DASHBOARD_METRICS = new Set([
  "Energy Production",
  "Energy Consumption",
  "Net Energy Balance",
]);

const METRIC_DESCRIPTIONS: Record<string, string> = {
  GDP: "Gross Domestic Product — the total monetary value of all goods and services produced by a country in a year.",
  "GDP growth":
    "Annual percentage change in GDP, indicating how fast a country's economy is growing or shrinking.",
  "GDP per capita":
    "GDP divided by population — a measure of average economic output and living standards.",
  "Debt-to-GDP":
    "Government debt as a percentage of GDP, showing how much a country owes relative to its economic output.",
  Inflation:
    "Annual percentage change in consumer prices, reflecting the rate at which purchasing power is eroding.",
  "Current Account Balance":
    "The difference between a country's exports and imports of goods, services, and transfers.",
  "Trade Openness":
    "Total trade (exports + imports) as a share of GDP, measuring how integrated a country is in global trade.",
  Exports: "Total value of goods and services sold by a country to the rest of the world.",
  Imports: "Total value of goods and services purchased by a country from the rest of the world.",
  "Trade Balance": "Exports minus imports — positive means a surplus, negative means a deficit.",
  "Military Spending": "Total government expenditure on defense and armed forces.",
  "Active Personnel": "Number of full-time active-duty military personnel.",
  "Military Inventory":
    "Breakdown of a country's military hardware: aircraft, land vehicles, and naval assets.",
  "Nuclear Capability":
    "Countries that possess nuclear warheads, with approximate stockpile sizes.",
  "Military Alliances":
    "Major military alliances each country belongs to (NATO, CSTO, ANZUS, GCC).",
  "Energy Production":
    "Total electricity generated by a country (TWh), with breakdown by source: coal, gas, oil, nuclear, hydro, solar, wind, and biofuel.",
  "Energy Consumption":
    "Total primary energy consumed by a country (TWh), with breakdown by source: coal, gas, oil, nuclear, hydro, solar, wind, biofuel, and other renewables.",
  "Net Energy Balance":
    "Net energy imports as a percentage of energy use. Negative values indicate net exporters; positive values indicate net importers.",
  "Energy Infrastructure":
    "Major energy infrastructure from the WRI Global Power Plant Database. Select a type to view nuclear, hydro, solar, wind, gas, oil, or coal facilities above minimum capacity thresholds.",
  "Energy Resources":
    "Proven reserves of oil (billion barrels), natural gas (trillion cubic meters), and coal (billion tonnes) by country.",
  "Critical Minerals":
    "Proven reserves of critical minerals essential for technology, energy transition, and defense: lithium, rare earths, copper, nickel, cobalt, uranium, iron ore, bauxite, and zinc.",
  "Agricultural Resources":
    "Annual production of major crops — wheat, corn, rice, and soybeans — by country (million tonnes). Data spans 1961–2024 from FAOSTAT.",
  "Arable Land":
    "Arable land per capita (hectares per person) — land under temporary crops, temporary meadows, and land temporarily fallow.",
  "Freshwater Resources":
    "Renewable internal freshwater resources per capita (cubic meters) — internal river flows and groundwater from rainfall.",
  Population:
    "Total population — all residents regardless of legal status or citizenship, midyear estimates from the World Bank.",
  "Population Growth":
    "Annual population growth rate (%). Derived from midyear population estimates by the World Bank.",
  "Fertility Rate":
    "Total fertility rate — the average number of children a woman would bear over her lifetime based on current age-specific rates.",
  "Net Migration":
    "Net number of migrants (immigrants minus emigrants) during a five-year period. Positive values indicate more people entering the country.",
  "Life Expectancy":
    "Life expectancy at birth — the average number of years a newborn would live under current mortality patterns.",
  "Age Dependency":
    "Age dependency ratio — the number of dependents (people younger than 15 or older than 64) per 100 working-age population.",
  "Labor Force":
    "Labor force participation rate — the proportion of the population aged 15 and older that is economically active.",
  "Population 65+":
    "Share of population aged 65 and above as a percentage of total population, indicating the level of demographic aging.",
  "Population 0-14":
    "Share of population aged 0–14 as a percentage of total population, reflecting youth demographics.",
  "Median Age":
    "The age that divides a population into two equal halves — half are younger and half are older. Data from UN World Population Prospects 2024.",
};

// Trade metrics that show the trade dashboard on click
const TRADE_DASHBOARD_METRICS = new Set(["Trade Openness", "Exports", "Imports", "Trade Balance"]);

// Metrics that have a historical line chart (inside the shared chart-modal-overlay)
const CHART_METRICS = new Set([
  "GDP",
  "GDP per capita",
  "Debt-to-GDP",
  "Current Account Balance",
  "Net Energy Balance",
]);

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
  const [infraType, setInfraType] = useState<InfraType | null>(null);
  const [infraCounts, setInfraCounts] = useState<Partial<Record<InfraType, number>>>({});
  const [showInfraDashboard, setShowInfraDashboard] = useState(false);
  const [reserveType, setReserveType] = useState<ReserveType | null>(null);
  const [showReservesDashboard, setShowReservesDashboard] = useState<ReserveType | null>(null);
  const [mineralType, setMineralType] = useState<MineralType | null>(null);
  const [mineralView, setMineralView] = useState<MineralView>("reserves");
  const [showMineralsDashboard, setShowMineralsDashboard] = useState<MineralType | null>(null);
  const [cropType, setCropType] = useState<CropType | null>(null);
  const [showCropDashboard, setShowCropDashboard] = useState<CropType | null>(null);
  const [infoBalloonAutoShow, setInfoBalloonAutoShow] = useState(false);

  useEffect(() => {
    if (selectedMetric !== "Energy Infrastructure") return;
    (["nuclear", "hydro", "solar", "wind", "coal", "gas", "oil"] as InfraType[]).forEach((type) => {
      fetch(`/data/infrastructure/${INFRA_CONFIGS[type].file}`)
        .then((r) => r.json())
        .then((d: unknown[]) => setInfraCounts((prev) => ({ ...prev, [type]: d.length })))
        .catch(console.error);
    });
  }, [selectedMetric]);

  useEffect(() => {
    if (!selectedMetric || !METRIC_DESCRIPTIONS[selectedMetric] || getInfoDismissedCookie()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state on metric change
      setInfoBalloonAutoShow(false);
      return;
    }
    setInfoBalloonAutoShow(true);
    const timer = setTimeout(() => setInfoBalloonAutoShow(false), 5000);
    return () => clearTimeout(timer);
  }, [selectedMetric]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedMetric(null);
    setShowChart(false);
  };

  const handleSelectMetric = (metric: string) => {
    if (metric !== selectedMetric) setShowChart(false);
    if (metric !== "Energy Infrastructure") setInfraType(null);
    if (metric !== "Energy Resources") setReserveType(null);
    if (metric !== "Critical Minerals") {
      setMineralType(null);
      setMineralView("reserves");
    }
    if (metric !== "Agricultural Resources") {
      setCropType(null);
      setShowCropDashboard(null);
    }
    setSelectedMetric(metric);
  };

  const handleInfraSelect = (t: InfraType) => {
    setInfraType((prev) => (prev === t ? null : t));
    setShowInfraDashboard(false);
  };

  const handleReserveSelect = (t: ReserveType) => {
    setReserveType((prev) => (prev === t ? null : t));
    setShowReservesDashboard(null);
  };

  const handleMineralSelect = (t: MineralType) => {
    setMineralType((prev) => (prev === t ? null : t));
    setShowMineralsDashboard(null);
  };

  const handleMineralViewChange = (view: MineralView) => {
    setMineralView(view);
    setMineralType(null);
    setShowMineralsDashboard(null);
  };

  const handleCropSelect = (t: CropType) => {
    setCropType((prev) => (prev === t ? null : t));
    setShowCropDashboard(null);
  };

  const handleYearRangeUpdate = useCallback((startYear: number, endYear: number) => {
    setAvailableYearRange({ startYear, endYear });
    setSelectedYear((prev) => {
      if (prev < startYear) return startYear;
      if (prev > endYear) return endYear;
      return prev;
    });
  }, []);

  return (
    <div className="app">
      <MetricButtons
        category={selectedCategory}
        selectedMetric={selectedMetric}
        onSelectMetric={handleSelectMetric}
        showChart={showChart}
        onToggleChart={() => setShowChart((v) => !v)}
        mineralView={mineralView}
        onMineralViewChange={handleMineralViewChange}
      />
      <WorldMap
        selectedMetric={selectedMetric}
        selectedYear={selectedYear}
        onYearRangeUpdate={handleYearRangeUpdate}
        onCountryClick={
          selectedMetric &&
          (DASHBOARD_METRICS.has(selectedMetric) ||
            TRADE_DASHBOARD_METRICS.has(selectedMetric) ||
            MILITARY_INVENTORY_METRICS.has(selectedMetric) ||
            ALLIANCE_METRICS.has(selectedMetric) ||
            ENERGY_DASHBOARD_METRICS.has(selectedMetric))
            ? (code, name, data) => setSelectedCountry({ code, name, data })
            : undefined
        }
        infraType={selectedMetric === "Energy Infrastructure" ? infraType : null}
        showPipelines={selectedMetric === "Energy Infrastructure" && infraType === "oil"}
        reserveType={selectedMetric === "Energy Resources" ? reserveType : null}
        mineralType={selectedMetric === "Critical Minerals" ? mineralType : null}
        mineralView={mineralView}
        cropType={selectedMetric === "Agricultural Resources" ? cropType : null}
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
      {selectedMetric === "Energy Infrastructure" && (
        <InfrastructureToggle
          activeType={infraType}
          counts={infraCounts}
          onSelect={handleInfraSelect}
          onChartOpen={() => setShowInfraDashboard(true)}
        />
      )}
      {showInfraDashboard && infraType && (
        <InfrastructureDashboard
          infraType={infraType}
          onClose={() => setShowInfraDashboard(false)}
        />
      )}
      {selectedMetric === "Energy Resources" && (
        <ReservesToggle
          activeType={reserveType}
          onSelect={handleReserveSelect}
          onChartOpen={(t) => setShowReservesDashboard(t)}
        />
      )}
      {showReservesDashboard && (
        <ReservesDashboard
          reserveType={showReservesDashboard}
          onClose={() => setShowReservesDashboard(null)}
        />
      )}
      {selectedMetric === "Critical Minerals" && (
        <MineralsToggle
          activeType={mineralType}
          onSelect={handleMineralSelect}
          onChartOpen={(t) => setShowMineralsDashboard(t)}
          mineralView={mineralView}
        />
      )}
      {showMineralsDashboard && (
        <MineralsDashboard
          mineralType={showMineralsDashboard}
          mineralView={mineralView}
          onClose={() => setShowMineralsDashboard(null)}
        />
      )}
      {selectedMetric === "Agricultural Resources" && (
        <AgricultureToggle
          activeType={cropType}
          onSelect={handleCropSelect}
          onChartOpen={(t) => setShowCropDashboard(t)}
        />
      )}
      {showCropDashboard && (
        <AgricultureDashboard
          cropType={showCropDashboard}
          selectedYear={selectedYear}
          onClose={() => setShowCropDashboard(null)}
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
            {selectedMetric === "Net Energy Balance" && (
              <NetEnergyBalanceLineChart
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
      {showChart && selectedMetric === "Energy Production" && (
        <EnergyProductionLineChart onClose={() => setShowChart(false)} />
      )}
      {showChart && selectedMetric === "Energy Consumption" && (
        <EnergyConsumptionLineChart onClose={() => setShowChart(false)} />
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
      {showChart && selectedMetric === "Nuclear Capability" && (
        <NuclearWarheadsCompare onClose={() => setShowChart(false)} />
      )}
      {showChart && selectedMetric === "Arable Land" && (
        <ResourceLineChart metric="Arable Land" onClose={() => setShowChart(false)} />
      )}
      {showChart && selectedMetric === "Freshwater Resources" && (
        <ResourceLineChart metric="Freshwater Resources" onClose={() => setShowChart(false)} />
      )}
      {showChart && selectedMetric === "Population" && (
        <ResourceLineChart metric="Population" onClose={() => setShowChart(false)} />
      )}
      {showChart && selectedMetric === "Population Growth" && (
        <ResourceLineChart metric="Population Growth" onClose={() => setShowChart(false)} />
      )}
      {showChart && selectedMetric === "Fertility Rate" && (
        <ResourceLineChart metric="Fertility Rate" onClose={() => setShowChart(false)} />
      )}
      {showChart && selectedMetric === "Net Migration" && (
        <ResourceLineChart metric="Net Migration" onClose={() => setShowChart(false)} />
      )}
      {showChart && selectedMetric === "Life Expectancy" && (
        <ResourceLineChart metric="Life Expectancy" onClose={() => setShowChart(false)} />
      )}
      {showChart && selectedMetric === "Age Dependency" && (
        <ResourceLineChart metric="Age Dependency" onClose={() => setShowChart(false)} />
      )}
      {showChart && selectedMetric === "Labor Force" && (
        <ResourceLineChart metric="Labor Force" onClose={() => setShowChart(false)} />
      )}
      {showChart && selectedMetric === "Population 65+" && (
        <ResourceLineChart metric="Population 65+" onClose={() => setShowChart(false)} />
      )}
      {showChart && selectedMetric === "Population 0-14" && (
        <ResourceLineChart metric="Population 0-14" onClose={() => setShowChart(false)} />
      )}
      {showChart && selectedMetric === "Median Age" && (
        <ResourceLineChart metric="Median Age" onClose={() => setShowChart(false)} />
      )}
      {selectedCountry && selectedMetric && ALLIANCE_METRICS.has(selectedMetric) && (
        <AllianceDashboard
          countryCode={selectedCountry.code}
          onClose={() => setSelectedCountry(null)}
        />
      )}
      {selectedCountry && selectedMetric === "Energy Production" && (
        <EnergyProductionDashboard
          countryCode={selectedCountry.code}
          countryName={selectedCountry.name}
          selectedYear={selectedYear}
          onClose={() => setSelectedCountry(null)}
        />
      )}
      {selectedCountry && selectedMetric === "Energy Consumption" && (
        <EnergyConsumptionDashboard
          countryCode={selectedCountry.code}
          countryName={selectedCountry.name}
          selectedYear={selectedYear}
          onClose={() => setSelectedCountry(null)}
        />
      )}
      {selectedCountry && selectedMetric === "Net Energy Balance" && (
        <NetEnergyBalanceDashboard
          countryCode={selectedCountry.code}
          countryName={selectedCountry.name}
          selectedYear={selectedYear}
          data={selectedCountry.data}
          onClose={() => setSelectedCountry(null)}
        />
      )}
      {selectedMetric && METRIC_DESCRIPTIONS[selectedMetric] && (
        <div
          className={`info-btn-wrapper${infoBalloonAutoShow ? " info-auto-show" : ""}`}
          key={selectedMetric}
        >
          <div className="info-balloon">
            <strong>{selectedMetric}</strong>
            <p>{METRIC_DESCRIPTIONS[selectedMetric]}</p>
            {infoBalloonAutoShow && (
              <button
                className="info-balloon-close"
                aria-label="Dismiss info auto-show"
                onClick={() => {
                  setInfoDismissedCookie();
                  setInfoBalloonAutoShow(false);
                }}
              >
                &times;
              </button>
            )}
          </div>
          <div className="info-btn-ring-wrapper">
            <button className="info-btn" aria-label="Metric information">
              i
            </button>
            {infoBalloonAutoShow && (
              <svg className="info-btn-countdown" viewBox="0 0 62 62">
                <circle className="info-btn-countdown-track" cx="31" cy="31" r="28" />
                <circle
                  className="info-btn-countdown-fill"
                  cx="31"
                  cy="31"
                  r="28"
                  key={selectedMetric}
                />
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
