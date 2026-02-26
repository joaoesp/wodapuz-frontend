import { useEffect, useState } from "react";
import { gfpService, type GfpCountryDetail } from "./services/gfpService";
import "./MilitaryInventoryDashboard.css";

interface MilitaryInventoryDashboardProps {
  countryCode: string;
  countryName: string;
  onClose: () => void;
}

function fmt(value: number | null): string {
  if (value === null || value === undefined) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${value.toLocaleString("en-US")}`;
  return `${value}`;
}

function StatCard({ label, value }: { label: string; value: number | null }) {
  const noData = value === null || value === undefined;
  return (
    <div className="mil-inv-stat">
      <span className="mil-inv-stat-label">{label}</span>
      <span className={`mil-inv-stat-value${noData ? " no-data" : ""}`}>
        {noData ? "N/A" : fmt(value)}
      </span>
    </div>
  );
}

function MilitaryInventoryDashboard({
  countryCode,
  countryName,
  onClose,
}: MilitaryInventoryDashboardProps) {
  const [detail, setDetail] = useState<GfpCountryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    gfpService
      .fetchCountryDetail(countryCode)
      .then(setDetail)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load data");
      })
      .finally(() => setLoading(false));
  }, [countryCode]);

  return (
    <div className="mil-inv-overlay" onClick={onClose}>
      <div className="mil-inv-dashboard" onClick={(e) => e.stopPropagation()}>
        <div className="mil-inv-header">
          <div>
            <h2 className="mil-inv-title">{countryName}</h2>
            <p className="mil-inv-subtitle">
              Military Inventory — Global Firepower {new Date().getFullYear()}
            </p>
          </div>
          <button className="mil-inv-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {loading ? (
          <div className="mil-inv-loading">Loading military inventory…</div>
        ) : error ? (
          <div className="mil-inv-loading">Error: {error}</div>
        ) : !detail ? (
          <div className="mil-inv-loading">No data available.</div>
        ) : (
          <div className="mil-inv-sections">
            <section className="mil-inv-section">
              <h3 className="mil-inv-section-title">Air Power</h3>
              <div className="mil-inv-grid">
                <StatCard label="Total Aircraft" value={detail.airPower.totalAircraft} />
                <StatCard label="Fighters" value={detail.airPower.fighters} />
                <StatCard label="Attack Aircraft" value={detail.airPower.attackAircraft} />
                <StatCard label="Helicopters" value={detail.airPower.helicopters} />
                <StatCard label="Attack Helicopters" value={detail.airPower.attackHelicopters} />
              </div>
            </section>

            <section className="mil-inv-section">
              <h3 className="mil-inv-section-title">Land Forces</h3>
              <div className="mil-inv-grid">
                <StatCard label="Tanks" value={detail.landForces.tanks} />
                <StatCard label="Armored Vehicles" value={detail.landForces.armoredVehicles} />
                <StatCard
                  label="Self-Propelled Artillery"
                  value={detail.landForces.selfPropelledArtillery}
                />
                <StatCard label="Towed Artillery" value={detail.landForces.towedArtillery} />
                <StatCard label="Rocket Artillery" value={detail.landForces.rocketArtillery} />
              </div>
            </section>

            <section className="mil-inv-section">
              <h3 className="mil-inv-section-title">Naval Forces</h3>
              <div className="mil-inv-grid">
                <StatCard label="Total Assets" value={detail.navalForces.totalAssets} />
                <StatCard label="Total Tonnage" value={detail.navalForces.totalTonnage} />
                <StatCard label="Carriers" value={detail.navalForces.carriers} />
                <StatCard label="Destroyers" value={detail.navalForces.destroyers} />
                <StatCard label="Frigates" value={detail.navalForces.frigates} />
                <StatCard label="Submarines" value={detail.navalForces.submarines} />
                <StatCard label="Corvettes" value={detail.navalForces.corvettes} />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default MilitaryInventoryDashboard;
