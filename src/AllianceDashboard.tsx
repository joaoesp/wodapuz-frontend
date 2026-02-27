import "./AllianceDashboard.css";

interface AllianceDashboardProps {
  countryCode: string;
  onClose: () => void;
}

interface Member {
  code: string;
  name: string;
}

interface AllianceInfo {
  fullName: string;
  founded: number;
  hq: string;
  color: string;
  description: string;
  members: Member[];
}

// Country → alliance name
const COUNTRY_TO_ALLIANCE: Record<string, string> = {
  // NATO
  ALB: "NATO",
  BEL: "NATO",
  BGR: "NATO",
  CAN: "NATO",
  HRV: "NATO",
  CZE: "NATO",
  DNK: "NATO",
  EST: "NATO",
  FIN: "NATO",
  FRA: "NATO",
  DEU: "NATO",
  GRC: "NATO",
  HUN: "NATO",
  ISL: "NATO",
  ITA: "NATO",
  LVA: "NATO",
  LTU: "NATO",
  LUX: "NATO",
  MNE: "NATO",
  NLD: "NATO",
  MKD: "NATO",
  NOR: "NATO",
  POL: "NATO",
  PRT: "NATO",
  ROU: "NATO",
  SVK: "NATO",
  SVN: "NATO",
  ESP: "NATO",
  SWE: "NATO",
  TUR: "NATO",
  GBR: "NATO",
  USA: "NATO",
  // CSTO
  RUS: "CSTO",
  BLR: "CSTO",
  KAZ: "CSTO",
  KGZ: "CSTO",
  TJK: "CSTO",
  // ANZUS
  AUS: "ANZUS",
  NZL: "ANZUS",
  // GCC
  SAU: "GCC",
  ARE: "GCC",
  KWT: "GCC",
  QAT: "GCC",
  BHR: "GCC",
  OMN: "GCC",
};

const ALLIANCE_INFO: Record<string, AllianceInfo> = {
  NATO: {
    fullName: "North Atlantic Treaty Organization",
    founded: 1949,
    hq: "Brussels, Belgium",
    color: "#1a6db5",
    description:
      "A collective defense alliance binding North American and European democracies under Article 5 — an armed attack against one member is considered an attack against all. Founded in 1949 to deter Soviet expansionism, NATO has expanded from its original 12 members to 32 since the end of the Cold War, most recently admitting Finland (2023) and Sweden (2024).",
    members: [
      { code: "ALB", name: "Albania" },
      { code: "BEL", name: "Belgium" },
      { code: "BGR", name: "Bulgaria" },
      { code: "CAN", name: "Canada" },
      { code: "HRV", name: "Croatia" },
      { code: "CZE", name: "Czech Republic" },
      { code: "DNK", name: "Denmark" },
      { code: "EST", name: "Estonia" },
      { code: "FIN", name: "Finland" },
      { code: "FRA", name: "France" },
      { code: "DEU", name: "Germany" },
      { code: "GRC", name: "Greece" },
      { code: "HUN", name: "Hungary" },
      { code: "ISL", name: "Iceland" },
      { code: "ITA", name: "Italy" },
      { code: "LVA", name: "Latvia" },
      { code: "LTU", name: "Lithuania" },
      { code: "LUX", name: "Luxembourg" },
      { code: "MNE", name: "Montenegro" },
      { code: "NLD", name: "Netherlands" },
      { code: "MKD", name: "North Macedonia" },
      { code: "NOR", name: "Norway" },
      { code: "POL", name: "Poland" },
      { code: "PRT", name: "Portugal" },
      { code: "ROU", name: "Romania" },
      { code: "SVK", name: "Slovakia" },
      { code: "SVN", name: "Slovenia" },
      { code: "ESP", name: "Spain" },
      { code: "SWE", name: "Sweden" },
      { code: "TUR", name: "Turkey" },
      { code: "GBR", name: "United Kingdom" },
      { code: "USA", name: "United States" },
    ],
  },
  CSTO: {
    fullName: "Collective Security Treaty Organization",
    founded: 2002,
    hq: "Moscow, Russia",
    color: "#c0392b",
    description:
      "A Russia-led mutual defense alliance of post-Soviet states, modeled on NATO's collective defense principle. Established as a formal organization in 2002, the CSTO has intervened militarily once — deploying forces to Kazakhstan in January 2022 to suppress civil unrest. Armenia suspended its membership in 2024 following Russian inaction during the Nagorno-Karabakh conflict.",
    members: [
      { code: "RUS", name: "Russia" },
      { code: "BLR", name: "Belarus" },
      { code: "KAZ", name: "Kazakhstan" },
      { code: "KGZ", name: "Kyrgyzstan" },
      { code: "TJK", name: "Tajikistan" },
    ],
  },
  ANZUS: {
    fullName: "Australia, New Zealand, United States Security Treaty",
    founded: 1951,
    hq: "No permanent headquarters",
    color: "#16a085",
    description:
      "A Pacific security treaty between Australia, New Zealand, and the United States. The US–New Zealand dimension was suspended in 1986 after New Zealand banned nuclear-armed ships from its ports, though the Australia–US partnership remains fully active. ANZUS was complemented in 2021 by the AUKUS pact, under which Australia will acquire nuclear-powered submarines with US and UK assistance.",
    members: [
      { code: "AUS", name: "Australia" },
      { code: "NZL", name: "New Zealand" },
      { code: "USA", name: "United States" },
    ],
  },
  GCC: {
    fullName: "Gulf Cooperation Council",
    founded: 1981,
    hq: "Riyadh, Saudi Arabia",
    color: "#f39c12",
    description:
      "A regional organization of Arab Gulf monarchies with economic, political, and security cooperation. The GCC maintains a unified military force, the Peninsula Shield Force, deployed during Bahrain's 2011 unrest. Member states share a common threat perception centered on Iran and collectively possess some of the world's largest sovereign wealth funds and oil reserves.",
    members: [
      { code: "SAU", name: "Saudi Arabia" },
      { code: "ARE", name: "United Arab Emirates" },
      { code: "KWT", name: "Kuwait" },
      { code: "QAT", name: "Qatar" },
      { code: "BHR", name: "Bahrain" },
      { code: "OMN", name: "Oman" },
    ],
  },
};

function AllianceDashboard({ countryCode, onClose }: AllianceDashboardProps) {
  const allianceName = COUNTRY_TO_ALLIANCE[countryCode];
  const info = allianceName ? ALLIANCE_INFO[allianceName] : null;

  if (!info) return null;

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-header">
          <div className="ad-header-accent" style={{ background: info.color }} />
          <div className="ad-header-text">
            <h2 className="ad-title" style={{ color: info.color }}>
              {allianceName}
            </h2>
            <p className="ad-full-name">{info.fullName}</p>
          </div>
          <button className="ad-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="ad-stats">
          <div className="ad-stat">
            <span className="ad-stat-label">Founded</span>
            <span className="ad-stat-value">{info.founded}</span>
          </div>
          <div className="ad-stat-divider" />
          <div className="ad-stat">
            <span className="ad-stat-label">Headquarters</span>
            <span className="ad-stat-value">{info.hq}</span>
          </div>
          <div className="ad-stat-divider" />
          <div className="ad-stat">
            <span className="ad-stat-label">Members</span>
            <span className="ad-stat-value">{info.members.length}</span>
          </div>
        </div>

        <p className="ad-description">{info.description}</p>

        <div className="ad-members-section">
          <h3 className="ad-members-title">Member States</h3>
          <div className="ad-members-grid">
            {info.members.map((member) => (
              <span
                key={member.code}
                className={`ad-member-chip ${member.code === countryCode ? "current" : ""}`}
                style={
                  member.code === countryCode ? { borderColor: info.color, color: info.color } : {}
                }
              >
                {member.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllianceDashboard;
