import "./MetricButtons.css";

const categoryMetrics: Record<string, string[]> = {
  Economy: [
    "GDP",
    "GDP growth",
    "GDP per capita",
    "Debt-to-GDP",
    "Inflation",
    "Current Account Balance",
  ],
  Trade: ["Trade Openness", "Exports", "Imports", "Trade Balance"],
  Military: [
    "Military Spending",
    "Active Personnel",
    "Military Inventory",
    "Nuclear Capability",
    "Military Alliances",
  ],
  Energy: [],
  Resources: [],
  Demographics: [],
};

const METRICS_WITH_CHARTS = new Set([
  "GDP",
  "GDP per capita",
  "Debt-to-GDP",
  "Current Account Balance",
  "Active Personnel",
  "Military Inventory",
  "Nuclear Capability",
]);

interface MetricButtonsProps {
  category: string;
  selectedMetric: string | null;
  onSelectMetric: (metric: string) => void;
  showChart: boolean;
  onToggleChart: () => void;
}

function MetricButtons({
  category,
  selectedMetric,
  onSelectMetric,
  showChart,
  onToggleChart,
}: MetricButtonsProps) {
  const metrics = categoryMetrics[category] || [];

  if (metrics.length === 0) {
    return null;
  }

  return (
    <div className="metric-buttons">
      {metrics.map((metric, index) => {
        const isSelected = selectedMetric === metric;
        const hasChart = METRICS_WITH_CHARTS.has(metric);

        return (
          <div key={metric} className="metric-row" style={{ animationDelay: `${index * 0.1}s` }}>
            {isSelected && hasChart && (
              <button
                className={`chart-toggle-btn ${showChart ? "active" : ""}`}
                onClick={onToggleChart}
                title="Toggle chart"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polyline
                    points="1,14 6,8 10,11 17,4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <button
              className={`metric-btn ${isSelected ? "active" : ""}`}
              onClick={() => onSelectMetric(metric)}
            >
              {metric}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default MetricButtons;
