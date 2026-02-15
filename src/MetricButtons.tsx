import { useState } from "react";
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
  Trade: [],
  Military: [],
  Energy: [],
  Resources: [],
  Demographics: [],
};

interface MetricButtonsProps {
  category: string;
  selectedMetric: string | null;
  onSelectMetric: (metric: string) => void;
}

function MetricButtons({ category, selectedMetric, onSelectMetric }: MetricButtonsProps) {
  const metrics = categoryMetrics[category] || [];

  if (metrics.length === 0) {
    return null;
  }

  return (
    <div className="metric-buttons">
      {metrics.map((metric) => (
        <button
          key={metric}
          className={`metric-btn ${selectedMetric === metric ? "active" : ""}`}
          onClick={() => onSelectMetric(metric)}
        >
          {metric}
        </button>
      ))}
    </div>
  );
}

export default MetricButtons;
