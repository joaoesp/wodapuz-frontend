import { useRef, useEffect } from "react";
import type { ReactNode } from "react";
import "./Navbar.css";

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
  Energy: [
    "Energy Production",
    "Energy Consumption",
    "Net Energy Balance",
    "Energy Infrastructure",
  ],
  Resources: [
    "Energy Resources",
    "Critical Minerals",
    "Agricultural Resources",
    "Arable Land",
    "Freshwater Resources",
  ],
  Demographics: [
    "Population",
    "Population Growth",
    "Fertility Rate",
    "Net Migration",
    "Life Expectancy",
    "Age Dependency",
    "Labor Force",
    "Population 65+",
    "Population 0-14",
    "Median Age",
  ],
};

const EconomyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="26"
    height="26"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="3" y1="20" x2="21" y2="20" />
  </svg>
);

const TradeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="26"
    height="26"
  >
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const MilitaryIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="26"
    height="26"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const EnergyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="26"
    height="26"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ResourcesIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="26"
    height="26"
  >
    <polygon points="6 3 18 3 22 9 12 22 2 9" />
    <line x1="2" y1="9" x2="22" y2="9" />
    <line x1="12" y1="22" x2="12" y2="9" />
    <path d="M6 3l3 6M18 3l-3 6" />
  </svg>
);

const DemographicsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="26"
    height="26"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const categories: { name: string; icon: ReactNode }[] = [
  { name: "Economy", icon: <EconomyIcon /> },
  { name: "Trade", icon: <TradeIcon /> },
  { name: "Military", icon: <MilitaryIcon /> },
  { name: "Energy", icon: <EnergyIcon /> },
  { name: "Resources", icon: <ResourcesIcon /> },
  { name: "Demographics", icon: <DemographicsIcon /> },
];

interface NavbarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedMetric: string | null;
  onSelectMetric: (metric: string) => void;
}

function Navbar({
  selectedCategory,
  onSelectCategory,
  selectedMetric,
  onSelectMetric,
}: NavbarProps) {
  return (
    <div className="category-nav">
      {categories.map((cat) => {
        const isActive = selectedCategory === cat.name;
        const metrics = categoryMetrics[cat.name] || [];

        return (
          <div key={cat.name} className="category-nav-group">
            <div className={`category-nav-item ${isActive ? "active" : ""}`}>
              <button
                className={`category-nav-btn ${isActive ? "active" : ""}`}
                onClick={() => onSelectCategory(cat.name)}
              >
                {cat.icon}
              </button>
              <span className="category-nav-label">{cat.name}</span>
            </div>
            <MetricsExpander active={isActive} metricCount={metrics.length}>
              {metrics.map((metric, index) => (
                <div
                  key={metric}
                  className="category-metric-row"
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <button
                    className={`category-metric-btn ${selectedMetric === metric ? "active" : ""}`}
                    onClick={() => onSelectMetric(metric)}
                  >
                    {metric}
                  </button>
                </div>
              ))}
            </MetricsExpander>
          </div>
        );
      })}
    </div>
  );
}

/** Wrapper that animates expand/collapse via measured scrollHeight */
function MetricsExpander({
  active,
  metricCount,
  children,
}: {
  active: boolean;
  metricCount: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) {
      el.style.maxHeight = el.scrollHeight + "px";
    } else {
      el.style.maxHeight = "0px";
    }
  }, [active, metricCount]);

  return (
    <div ref={ref} className={`category-metrics ${active ? "expanded" : ""}`}>
      {children}
    </div>
  );
}

export default Navbar;
