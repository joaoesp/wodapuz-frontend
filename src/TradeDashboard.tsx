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

function ClickablePartnerList({
  partners,
  selectedIso,
  onSelect,
  total,
}: {
  partners: TradePartner[];
  selectedIso: string | null;
  onSelect: (partner: TradePartner) => void;
  total?: number;
}) {
  const maxValue = partners[0]?.value ?? 1;
  const others = total != null ? total - partners.reduce((s, p) => s + p.value, 0) : 0;
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
      {others > 0 && (
        <div className="trade-bar-row">
          <div className="trade-bar-label">Others</div>
          <div className="trade-bar-track">
            <div
              className="trade-bar-fill"
              style={{
                width: `${(others / maxValue) * 100}%`,
                background: "rgba(156,200,55,0.35)",
              }}
            />
          </div>
          <div className="trade-bar-value">{formatValue(others)}</div>
        </div>
      )}
    </div>
  );
}

function ClickableProductList({
  products,
  selectedCode,
  onSelect,
}: {
  products: TradeProduct[];
  selectedCode: string | null;
  onSelect: (product: TradeProduct) => void;
}) {
  const maxValue = products[0]?.value ?? 1;
  return (
    <div>
      {products.map((product) => {
        const pct = maxValue > 0 ? (product.value / maxValue) * 100 : 0;
        const isActive = product.code === selectedCode;
        return (
          <div
            key={product.code}
            className={`trade-partner-row trade-bar-row${isActive ? " product-active" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(product)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(product)}
          >
            <div
              className="trade-bar-label"
              title={product.name}
              style={isActive ? { color: "#45b7d1", fontWeight: 600 } : undefined}
            >
              {shortProductName(product.name)}
            </div>
            <div className="trade-bar-track">
              <div
                className="trade-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: isActive ? "#45b7d1" : "rgba(69,183,209,0.35)",
                }}
              />
            </div>
            <div className="trade-bar-value">{formatValue(product.value)}</div>
          </div>
        );
      })}
    </div>
  );
}

function ProductHistoryChart({ data }: { data: { year: number; value: number }[] }) {
  const W = 340,
    H = 160;
  const padL = 52,
    padR = 8,
    padT = 8,
    padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const years = data.map((d) => d.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const maxValue = Math.max(...data.map((d) => d.value));

  const xScale = (year: number) =>
    maxYear === minYear
      ? padL + innerW / 2
      : padL + ((year - minYear) / (maxYear - minYear)) * innerW;

  const yScale = (value: number) =>
    maxValue === 0 ? padT + innerH : padT + innerH - (value / maxValue) * innerH;

  const points = data.map((d) => `${xScale(d.year)},${yScale(d.value)}`).join(" ");

  const yTicks = [0, maxValue / 2, maxValue];

  // Show every 2 years if there are more than 6 years
  const xTickYears = years.length > 6 ? years.filter((y) => (y - minYear) % 2 === 0) : years;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {/* Y-axis ticks */}
      {yTicks.map((v, i) => {
        const y = yScale(v);
        return (
          <g key={i}>
            <line x1={padL - 4} y1={y} x2={padL} y2={y} stroke="#555" strokeWidth={1} />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#888">
              {formatValue(v)}
            </text>
          </g>
        );
      })}

      {/* X-axis ticks */}
      {xTickYears.map((yr) => {
        const x = xScale(yr);
        return (
          <g key={yr}>
            <line
              x1={x}
              y1={padT + innerH}
              x2={x}
              y2={padT + innerH + 4}
              stroke="#555"
              strokeWidth={1}
            />
            <text
              x={x}
              y={padT + innerH + 14}
              textAnchor="middle"
              fontSize={9}
              fill="#888"
              transform={`rotate(-45, ${x}, ${padT + innerH + 14})`}
            >
              {yr}
            </text>
          </g>
        );
      })}

      {/* Axis lines */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="#444" strokeWidth={1} />
      <line
        x1={padL}
        y1={padT + innerH}
        x2={padL + innerW}
        y2={padT + innerH}
        stroke="#444"
        strokeWidth={1}
      />

      {/* Line */}
      {data.length > 1 && <polyline points={points} fill="none" stroke="#45b7d1" strokeWidth={2} />}

      {/* Dots */}
      {data.map((d) => (
        <circle key={d.year} cx={xScale(d.year)} cy={yScale(d.value)} r={3} fill="#45b7d1" />
      ))}
    </svg>
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
  const [selectedProduct, setSelectedProduct] = useState<TradeProduct | null>(null);
  const [productHistory, setProductHistory] = useState<
    Record<string, { year: number; value: number }[]>
  >({});
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData({ X: null, M: null });
    setLoading({ X: true, M: true });
    setSelectedPartner({ X: null, M: null });
    setPartnerProducts({});
    setSelectedProduct(null);

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

  // Clear selected product when partner or flow changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedProduct(null);
  }, [selectedPartner[flow], flow]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Fetch product history when a product is selected
  useEffect(() => {
    const partner = selectedPartner[flow] ?? data[flow]?.partners[0] ?? null;
    if (!selectedProduct || !partner) return;

    const histCacheKey = `${countryCode}-${partner.iso}-${selectedProduct.code}-${flow}`;
    if (productHistory[histCacheKey] !== undefined) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistoryLoading(true);
    unComtradeService
      .getProductHistory(countryCode, partner.iso, flow, selectedProduct.code)
      .then((d) => setProductHistory((prev) => ({ ...prev, [histCacheKey]: d.history })))
      .catch(console.error)
      .finally(() => setHistoryLoading(false));
  }, [selectedProduct, selectedPartner, flow, countryCode, year, data]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = data[flow];
  const isLoading = loading[flow];
  const hasData = current && (current.partners.length > 0 || current.products.length > 0);

  // Auto-select first partner when data is available; user selection overrides
  const activePartner = selectedPartner[flow] ?? current?.partners[0] ?? null;
  const cacheKey = activePartner ? `${countryCode}-${activePartner.iso}-${flow}` : null;
  const activeProducts = cacheKey ? (partnerProducts[cacheKey] ?? null) : null;

  const histCacheKey =
    selectedProduct && activePartner
      ? `${countryCode}-${activePartner.iso}-${selectedProduct.code}-${flow}`
      : null;
  const activeHistory = histCacheKey ? (productHistory[histCacheKey] ?? null) : null;

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
                  total={current.total}
                />
              </div>
              <div className="trade-chart-section">
                {selectedProduct ? (
                  <>
                    <div className="trade-history-header">
                      <button
                        className="trade-history-back"
                        onClick={() => setSelectedProduct(null)}
                      >
                        ← Products
                      </button>
                      <h4>{shortProductName(selectedProduct.name)}</h4>
                    </div>
                    {historyLoading ? (
                      <div className="trade-products-loading">Loading…</div>
                    ) : activeHistory === null ? (
                      <div className="trade-products-loading">No data.</div>
                    ) : (
                      <ProductHistoryChart data={activeHistory} />
                    )}
                  </>
                ) : (
                  <>
                    <h4>
                      {activePartner ? `Products with ${activePartner.name}` : "Select a partner"}
                    </h4>
                    {productsLoading ? (
                      <div className="trade-products-loading">Loading…</div>
                    ) : activeProducts === null ? (
                      <div className="trade-products-loading">No data.</div>
                    ) : (
                      <ClickableProductList
                        products={activeProducts}
                        selectedCode={null}
                        onSelect={setSelectedProduct}
                      />
                    )}
                  </>
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
