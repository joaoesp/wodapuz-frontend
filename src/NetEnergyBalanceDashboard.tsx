import { useEffect, useState } from "react";
import {
  unComtradeService,
  type EnergyTypeBreakdown,
  type TradePartner,
  type TradeProduct,
} from "./services/unComtradeService";
import "./TradeDashboard.css";

interface NetEnergyBalanceDashboardProps {
  countryCode: string;
  countryName: string;
  selectedYear: number;
  data: { year: number; value: number }[];
  onClose: () => void;
}

function formatValue(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toFixed(0)}`;
}

const ENERGY_NAMES: Record<string, string> = {
  "2701": "Coal",
  "2709": "Crude petroleum",
  "2710": "Petroleum products",
  "2711": "Natural gas / LPG",
  "2716": "Electrical energy",
};

const ALLOWED_ENERGY_CODES = new Set(Object.keys(ENERGY_NAMES));

function shortEnergyName(code: string, desc: string): string {
  if (ENERGY_NAMES[code]) return ENERGY_NAMES[code];
  const first = desc.split(";")[0].split(",")[0];
  return first.length > 30 ? first.slice(0, 28) + "…" : first;
}

function ClickableEnergyTypeList({
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
            className={`trade-partner-row trade-bar-row${isActive ? " active" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(product)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(product)}
          >
            <div className="trade-bar-label" title={product.name}>
              {shortEnergyName(product.code, product.name)}
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
            <div className="trade-bar-value">{formatValue(product.value)}</div>
          </div>
        );
      })}
    </div>
  );
}

function PartnerList({ partners, total }: { partners: TradePartner[]; total: number }) {
  const shown = partners.reduce((s, p) => s + p.value, 0);
  const others = total - shown;
  const maxValue = partners[0]?.value ?? 1;
  return (
    <div>
      {partners.map((partner) => {
        const pct = maxValue > 0 ? (partner.value / maxValue) * 100 : 0;
        return (
          <div key={partner.iso} className="trade-bar-row">
            <div className="trade-bar-label" title={partner.name}>
              {partner.name}
            </div>
            <div className="trade-bar-track">
              <div
                className="trade-bar-fill"
                style={{ width: `${pct}%`, background: "rgba(69,183,209,0.35)" }}
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
                background: "rgba(69,183,209,0.35)",
              }}
            />
          </div>
          <div className="trade-bar-value">{formatValue(others)}</div>
        </div>
      )}
    </div>
  );
}

function NetEnergyBalanceDashboard({
  countryCode,
  countryName,
  selectedYear,
  data,
  onClose,
}: NetEnergyBalanceDashboardProps) {
  const netBalance = (() => {
    const sorted = [...data].filter((d) => d.year <= selectedYear).sort((a, b) => b.year - a.year);
    return sorted[0]?.value ?? null;
  })();

  const defaultFlow: "X" | "M" = netBalance !== null && netBalance <= 0 ? "X" : "M";
  const [flow, setFlow] = useState<"X" | "M">(defaultFlow);

  const fetchYear = Math.min(selectedYear, 2023);

  const [energyTypes, setEnergyTypes] = useState<{
    X: EnergyTypeBreakdown | null;
    M: EnergyTypeBreakdown | null;
  }>({ X: null, M: null });
  const [loadingTypes, setLoadingTypes] = useState<{ X: boolean; M: boolean }>({
    X: true,
    M: true,
  });

  const [selectedProduct, setSelectedProduct] = useState<{
    X: TradeProduct | null;
    M: TradeProduct | null;
  }>({ X: null, M: null });
  const [typePartners, setTypePartners] = useState<
    Record<string, { partners: TradePartner[]; worldTotal: number }>
  >({});
  const [typePartnersLoading, setTypePartnersLoading] = useState(false);

  useEffect(() => {
    setEnergyTypes({ X: null, M: null });
    setLoadingTypes({ X: true, M: true });
    setSelectedProduct({ X: null, M: null });
    setTypePartners({} as Record<string, { partners: TradePartner[]; worldTotal: number }>);

    unComtradeService
      .getEnergyTypeBreakdown(countryCode, "X", fetchYear)
      .then((d) => setEnergyTypes((prev) => ({ ...prev, X: d })))
      .catch(console.error)
      .finally(() => setLoadingTypes((prev) => ({ ...prev, X: false })));

    unComtradeService
      .getEnergyTypeBreakdown(countryCode, "M", fetchYear)
      .then((d) => setEnergyTypes((prev) => ({ ...prev, M: d })))
      .catch(console.error)
      .finally(() => setLoadingTypes((prev) => ({ ...prev, M: false })));
  }, [countryCode, fetchYear]);

  const current = energyTypes[flow];
  const isLoading = loadingTypes[flow];
  const filteredProducts = current?.products.filter((p) => ALLOWED_ENERGY_CODES.has(p.code)) ?? [];
  const hasData = filteredProducts.length > 0;

  const activeProduct = selectedProduct[flow] ?? filteredProducts[0] ?? null;

  useEffect(() => {
    if (!activeProduct) return;
    const cacheKey = `${countryCode}-${activeProduct.code}-${flow}`;
    if (typePartners[cacheKey]) return;

    setTypePartnersLoading(true);
    unComtradeService
      .getEnergyTypePartners(countryCode, activeProduct.code, flow, fetchYear)
      .then((d) =>
        setTypePartners((prev) => ({
          ...prev,
          [cacheKey]: { partners: d.partners, worldTotal: d.worldTotal },
        }))
      )
      .catch(console.error)
      .finally(() => setTypePartnersLoading(false));
  }, [activeProduct, flow, countryCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const partnersCacheKey = activeProduct ? `${countryCode}-${activeProduct.code}-${flow}` : null;
  const activePartnersData = partnersCacheKey ? (typePartners[partnersCacheKey] ?? null) : null;
  const activePartners = activePartnersData?.partners ?? null;
  const activeWorldTotal = activePartnersData?.worldTotal ?? 0;

  const netBadge =
    netBalance !== null
      ? netBalance > 0
        ? `Net Importer — ${netBalance.toFixed(1)}% of energy use imported`
        : `Net Exporter — ${Math.abs(netBalance).toFixed(1)}% of energy use exported`
      : null;

  const badgeColor = netBalance !== null && netBalance > 0 ? "#e17055" : "#9cc837";

  return (
    <div className="trade-dashboard-overlay" onClick={onClose}>
      <div className="trade-dashboard" onClick={(e) => e.stopPropagation()}>
        <div className="trade-dashboard-header">
          <div>
            <h2 className="trade-dashboard-title">{countryName}</h2>
            <p className="trade-dashboard-subtitle">Energy Trade</p>
            {netBadge && (
              <p className="trade-dashboard-subtitle" style={{ color: badgeColor, marginTop: 2 }}>
                {netBadge}
              </p>
            )}
          </div>
          <div className="trade-dashboard-flow-toggle">
            <button
              className={`trade-flow-btn ${flow === "M" ? "active" : ""}`}
              onClick={() => setFlow("M")}
            >
              Imports
            </button>
            <button
              className={`trade-flow-btn ${flow === "X" ? "active" : ""}`}
              onClick={() => setFlow("X")}
            >
              Exports
            </button>
          </div>
          <button className="trade-dashboard-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="trade-dashboard-loading">
            <div className="trade-spinner" />
            Loading energy trade data…
          </div>
        ) : !hasData ? (
          <div className="trade-dashboard-loading">No data available for {fetchYear}.</div>
        ) : (
          <div className="trade-dashboard-charts">
            <div className="trade-chart-section">
              <h4>
                Energy {flow === "M" ? "Imports" : "Exports"} by Type — {fetchYear}
              </h4>
              <div className="trade-dashboard-total">
                Total: {formatValue(filteredProducts.reduce((s, p) => s + p.value, 0))}
              </div>
              <ClickableEnergyTypeList
                products={filteredProducts}
                selectedCode={activeProduct?.code ?? null}
                onSelect={(p) => setSelectedProduct((prev) => ({ ...prev, [flow]: p }))}
              />
            </div>
            <div className="trade-chart-section">
              <h4>
                {flow === "M" ? "Import" : "Export"} Partners
                {activeProduct
                  ? ` — ${shortEnergyName(activeProduct.code, activeProduct.name)}`
                  : ""}
              </h4>
              {activeWorldTotal > 0 && (
                <div className="trade-dashboard-total">Total: {formatValue(activeWorldTotal)}</div>
              )}
              {typePartnersLoading ? (
                <div className="trade-products-loading">
                  <div className="trade-spinner-sm" />
                  Loading partners…
                </div>
              ) : activePartners && activePartners.length > 0 ? (
                <PartnerList partners={activePartners} total={activeWorldTotal} />
              ) : activePartners && activePartners.length === 0 ? (
                <div className="trade-products-loading">No partner data available.</div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NetEnergyBalanceDashboard;
