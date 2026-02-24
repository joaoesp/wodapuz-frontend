import { useEffect, useState } from "react";
import { unComtradeService, type TradeData } from "./services/unComtradeService";
import "./TradeDashboard.css";

interface TradeDashboardProps {
  countryCode: string;
  countryName: string;
  year: number;
  onClose: () => void;
}

function formatValue(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toFixed(0)}`;
}

// Truncate long HS chapter descriptions to a readable label
function shortProductName(name: string): string {
  const firstSentence = name.split(";")[0].split(",")[0];
  return firstSentence.length > 30 ? firstSentence.slice(0, 28) + "…" : firstSentence;
}

function HorizontalBars({
  items,
  color,
}: {
  items: { label: string; value: number; pct: number }[];
  color: string;
}) {
  return (
    <div>
      {items.map((item) => (
        <div key={item.label} className="trade-bar-row">
          <div className="trade-bar-label" title={item.label}>
            {item.label}
          </div>
          <div className="trade-bar-track">
            <div className="trade-bar-fill" style={{ width: `${item.pct}%`, background: color }} />
          </div>
          <div className="trade-bar-value">{formatValue(item.value)}</div>
        </div>
      ))}
    </div>
  );
}

function TradeDashboard({ countryCode, countryName, year, onClose }: TradeDashboardProps) {
  const [flow, setFlow] = useState<"X" | "M">("X");
  const [data, setData] = useState<{ X: TradeData | null; M: TradeData | null }>({
    X: null,
    M: null,
  });
  const [loading, setLoading] = useState<{ X: boolean; M: boolean }>({ X: true, M: true });

  useEffect(() => {
    setData({ X: null, M: null });
    setLoading({ X: true, M: true });

    unComtradeService
      .getTradeData(countryCode, "X", year)
      .then((d) => setData((prev) => ({ ...prev, X: d })))
      .catch(console.error)
      .finally(() => setLoading((prev) => ({ ...prev, X: false })));

    unComtradeService
      .getTradeData(countryCode, "M", year)
      .then((d) => setData((prev) => ({ ...prev, M: d })))
      .catch(console.error)
      .finally(() => setLoading((prev) => ({ ...prev, M: false })));
  }, [countryCode, year]);

  const current = data[flow];
  const isLoading = loading[flow];

  const partnerItems =
    current?.partners.map((p, _i, arr) => ({
      label: p.name,
      value: p.value,
      pct: arr[0].value > 0 ? (p.value / arr[0].value) * 100 : 0,
    })) ?? [];

  const productItems =
    current?.products.map((p, _i, arr) => ({
      label: shortProductName(p.name),
      value: p.value,
      pct: arr[0].value > 0 ? (p.value / arr[0].value) * 100 : 0,
    })) ?? [];

  return (
    <div className="trade-dashboard-overlay" onClick={onClose}>
      <div className="trade-dashboard" onClick={(e) => e.stopPropagation()}>
        <div className="trade-dashboard-header">
          <div>
            <h2 className="trade-dashboard-title">{countryName}</h2>
            <p className="trade-dashboard-subtitle">Trade Overview — {year}</p>
          </div>
          <div className="trade-dashboard-flow-toggle">
            <button
              className={`trade-flow-btn ${flow === "X" ? "active" : ""}`}
              onClick={() => setFlow("X")}
            >
              Exports
            </button>
            <button
              className={`trade-flow-btn ${flow === "M" ? "active" : ""}`}
              onClick={() => setFlow("M")}
            >
              Imports
            </button>
          </div>
          <button className="trade-dashboard-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="trade-dashboard-loading">Loading trade data…</div>
        ) : !current ? (
          <div className="trade-dashboard-loading">No data available for {year}.</div>
        ) : (
          <>
            <div className="trade-dashboard-charts">
              <div className="trade-chart-section">
                <h4>Top Partners</h4>
                <HorizontalBars items={partnerItems} color="#9cc837" />
              </div>
              <div className="trade-chart-section">
                <h4>Top Products (HS 2-digit)</h4>
                <HorizontalBars items={productItems} color="#45b7d1" />
              </div>
            </div>
            <div className="trade-dashboard-total">
              Total {flow === "X" ? "exports" : "imports"}: {formatValue(current.total)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TradeDashboard;
