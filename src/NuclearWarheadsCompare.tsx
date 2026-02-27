import { useState } from "react";
import "./MilitaryInventoryCompare.css";
import "./NuclearWarheadsCompare.css";

interface NuclearWarheadsCompareProps {
  onClose: () => void;
}

// Source: Federation of American Scientists — Status of World Nuclear Forces 2024
// https://fas.org/initiative/status-world-nuclear-forces/
const NUCLEAR_DATA = [
  { code: "RUS", name: "Russia", total: 5580, deployed: 1558, stockpile: 4380 },
  { code: "USA", name: "United States", total: 5044, deployed: 1770, stockpile: 3708 },
  { code: "CHN", name: "China", total: 500, deployed: 0, stockpile: 500 },
  { code: "FRA", name: "France", total: 290, deployed: 280, stockpile: 290 },
  { code: "GBR", name: "United Kingdom", total: 225, deployed: 120, stockpile: 225 },
  { code: "IND", name: "India", total: 172, deployed: 0, stockpile: 172 },
  { code: "PAK", name: "Pakistan", total: 170, deployed: 0, stockpile: 170 },
  { code: "ISR", name: "Israel", total: 90, deployed: 0, stockpile: 90 },
  { code: "PRK", name: "North Korea", total: 50, deployed: 0, stockpile: 50 },
];

type Tab = "total" | "deployed" | "stockpile";

const TABS: { key: Tab; label: string; description: string }[] = [
  {
    key: "total",
    label: "Total",
    description: "All warheads including retired units awaiting dismantlement",
  },
  {
    key: "deployed",
    label: "Deployed",
    description: "Warheads mounted on missiles or at operational bases",
  },
  {
    key: "stockpile",
    label: "Military Stockpile",
    description: "Active warheads available for use, excluding retired units",
  },
];

const COUNTRY_COLORS: Record<string, string> = {
  RUS: "#74b9ff",
  USA: "#9cc837",
  CHN: "#ff6b6b",
  FRA: "#fd79a8",
  GBR: "#6c5ce7",
  IND: "#f9ca24",
  PAK: "#26de81",
  ISR: "#45b7d1",
  PRK: "#ff9f43",
};

function NuclearWarheadsCompare({ onClose }: NuclearWarheadsCompareProps) {
  const [activeTab, setActiveTab] = useState<Tab>("total");

  const tab = TABS.find((t) => t.key === activeTab)!;

  const barData = [...NUCLEAR_DATA]
    .map((d) => ({ ...d, value: d[activeTab] }))
    .sort((a, b) => b.value - a.value);

  const maxValue = barData[0].value;

  return (
    <div className="mic-overlay" onClick={onClose}>
      <div className="mic-modal nwc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mic-header">
          <div>
            <h2 className="mic-title">Nuclear Warheads — Country Comparison</h2>
            <p className="mic-subtitle">
              Source: Federation of American Scientists, Status of World Nuclear Forces 2024
            </p>
          </div>
          <button className="mic-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="mic-sections">
          <section className="mic-section">
            <div className="mic-metric-tabs">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={`mic-metric-tab ${activeTab === t.key ? "active" : ""}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="nwc-tab-description">{tab.description}</p>

            <div className="mic-bar-chart">
              {barData.map((d) => (
                <div key={d.code} className="mic-bar-row">
                  <span className="mic-bar-label" title={d.name}>
                    {d.name}
                  </span>
                  <div className="mic-bar-track">
                    <div
                      className="mic-bar"
                      style={{
                        width: d.value > 0 ? `${(d.value / maxValue) * 100}%` : "0%",
                        background: COUNTRY_COLORS[d.code] ?? "#888",
                      }}
                    />
                  </div>
                  <span className="mic-bar-value">
                    {d.value > 0 ? d.value.toLocaleString("en-US") : "—"}
                  </span>
                </div>
              ))}
            </div>

            <p className="nwc-disclaimer">
              * Estimates only. Israel maintains a policy of nuclear ambiguity. North Korean and
              Chinese figures are approximate. Deployed count excludes warheads in storage.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default NuclearWarheadsCompare;
