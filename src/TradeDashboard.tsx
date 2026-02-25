import { useEffect, useState } from "react";
import {
  unComtradeService,
  type TradeData,
  type TradePartner,
  type TradeProduct,
} from "./services/unComtradeService";
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

function ClickablePartnerList({
  partners,
  selectedIso,
  onSelect,
}: {
  partners: TradePartner[];
  selectedIso: string | null;
  onSelect: (partner: TradePartner) => void;
}) {
  const maxValue = partners[0]?.value ?? 1;
  return (
    <div>
      {partners.map((partner) => {
        const pct = maxValue > 0 ? (partner.value / maxValue) * 100 : 0;
        const isActive = partner.iso === selectedIso;
        return (
          <div
            key={partner.iso}
            className={`trade-partner-row trade-bar-row${isActive ? " active" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(partner)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(partner)}
          >
            <div className="trade-bar-label" title={partner.name}>
              {partner.name}
            </div>
            <div className="trade-bar-track">
              <div
                className="trade-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: isActive ? "#9cc837" : "rgba(156,200,55,0.35)",
                }}
              />
            </div>
            <div className="trade-bar-value">{formatValue(partner.value)}</div>
          </div>
        );
      })}
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
  const [selectedPartner, setSelectedPartner] = useState<{
    X: TradePartner | null;
    M: TradePartner | null;
  }>({ X: null, M: null });
  const [partnerProducts, setPartnerProducts] = useState<Record<string, TradeProduct[]>>({});
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData({ X: null, M: null });
    setLoading({ X: true, M: true });
    setSelectedPartner({ X: null, M: null });
    setPartnerProducts({});

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

  // Fetch products for active partner (user selection, or first partner as default)
  useEffect(() => {
    const partner = selectedPartner[flow] ?? data[flow]?.partners[0] ?? null;
    if (!partner) return;

    const cacheKey = `${countryCode}-${partner.iso}-${flow}`;
    if (partnerProducts[cacheKey] !== undefined) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProductsLoading(true);
    unComtradeService
      .getPartnerProducts(countryCode, partner.iso, flow, year)
      .then((d) => setPartnerProducts((prev) => ({ ...prev, [cacheKey]: d.products })))
      .catch(console.error)
      .finally(() => setProductsLoading(false));
  }, [selectedPartner, flow, countryCode, year, data]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = data[flow];
  const isLoading = loading[flow];
  const hasData = current && (current.partners.length > 0 || current.products.length > 0);

  // Auto-select first partner when data is available; user selection overrides
  const activePartner = selectedPartner[flow] ?? current?.partners[0] ?? null;
  const cacheKey = activePartner ? `${countryCode}-${activePartner.iso}-${flow}` : null;
  const activeProducts = cacheKey ? (partnerProducts[cacheKey] ?? null) : null;

  const productItems =
    activeProducts?.map((p, _i, arr) => ({
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
        ) : !hasData ? (
          <div className="trade-dashboard-loading">No data.</div>
        ) : (
          <>
            <div className="trade-dashboard-charts">
              <div className="trade-chart-section">
                <h4>Top Partners</h4>
                <ClickablePartnerList
                  partners={current.partners}
                  selectedIso={activePartner?.iso ?? null}
                  onSelect={(p) => setSelectedPartner((prev) => ({ ...prev, [flow]: p }))}
                />
              </div>
              <div className="trade-chart-section">
                <h4>
                  {activePartner ? `Products with ${activePartner.name}` : "Select a partner"}
                </h4>
                {productsLoading ? (
                  <div className="trade-products-loading">Loading…</div>
                ) : activeProducts === null ? (
                  <div className="trade-products-loading">No data.</div>
                ) : (
                  <HorizontalBars items={productItems} color="#45b7d1" />
                )}
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
