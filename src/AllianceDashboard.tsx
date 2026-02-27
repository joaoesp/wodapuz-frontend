import "./AllianceDashboard.css";

interface AllianceDashboardProps {
  countryCode: string;
  countryName: string;
  onClose: () => void;
}

interface AllianceInfo {
  fullName: string;
  founded: number;
  hq: string;
  color: string;
  description: string;
  members: string[];
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
  // SCO
  CHN: "SCO",
  IND: "SCO",
  PAK: "SCO",
  IRN: "SCO",
  UZB: "SCO",
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
      "Albania",
      "Belgium",
      "Bulgaria",
      "Canada",
      "Croatia",
      "Czech Republic",
      "Denmark",
      "Estonia",
      "Finland",
      "France",
      "Germany",
      "Greece",
      "Hungary",
      "Iceland",
      "Italy",
      "Latvia",
      "Lithuania",
      "Luxembourg",
      "Montenegro",
      "Netherlands",
      "North Macedonia",
      "Norway",
      "Poland",
      "Portugal",
      "Romania",
      "Slovakia",
      "Slovenia",
      "Spain",
      "Sweden",
      "Turkey",
      "United Kingdom",
      "United States",
    ],
  },
  CSTO: {
    fullName: "Collective Security Treaty Organization",
    founded: 2002,
    hq: "Moscow, Russia",
    color: "#c0392b",
    description:
      "A Russia-led mutual defense alliance of post-Soviet states, modeled on NATO's collective defense principle. Established as a formal organization in 2002, the CSTO has intervened militarily once — deploying forces to Kazakhstan in January 2022 to suppress civil unrest. Armenia suspended its membership in 2024 following Russian inaction during the Nagorno-Karabakh conflict.",
    members: ["Russia", "Belarus", "Kazakhstan", "Kyrgyzstan", "Tajikistan"],
  },
  SCO: {
    fullName: "Shanghai Cooperation Organisation",
    founded: 2001,
    hq: "Beijing, China",
    color: "#e67e22",
    description:
      "A Eurasian political, economic, and security organization led by China and Russia, covering counterterrorism, border security, and regional stability. Its membership spans the world's two most populous nations and three nuclear-armed states. The SCO has grown significantly, admitting India and Pakistan (2017) and Iran (2023), making it the largest regional organization by geographic area and population covered.",
    members: ["China", "India", "Pakistan", "Iran", "Uzbekistan"],
  },
  ANZUS: {
    fullName: "Australia, New Zealand, United States Security Treaty",
    founded: 1951,
    hq: "No permanent headquarters",
    color: "#16a085",
    description:
      "A Pacific security treaty between Australia, New Zealand, and the United States. The US–New Zealand dimension was suspended in 1986 after New Zealand banned nuclear-armed ships from its ports, though the Australia–US partnership remains fully active. ANZUS was complemented in 2021 by the AUKUS pact, under which Australia will acquire nuclear-powered submarines with US and UK assistance.",
    members: ["Australia", "New Zealand"],
  },
  GCC: {
    fullName: "Gulf Cooperation Council",
    founded: 1981,
    hq: "Riyadh, Saudi Arabia",
    color: "#f39c12",
    description:
      "A regional organization of Arab Gulf monarchies with economic, political, and security cooperation. The GCC maintains a unified military force, the Peninsula Shield Force, deployed during Bahrain's 2011 unrest. Member states share a common threat perception centered on Iran and collectively possess some of the world's largest sovereign wealth funds and oil reserves.",
    members: ["Saudi Arabia", "United Arab Emirates", "Kuwait", "Qatar", "Bahrain", "Oman"],
  },
};

function AllianceDashboard({ countryCode, countryName, onClose }: AllianceDashboardProps) {
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
                key={member}
                className={`ad-member-chip ${member === countryName ? "current" : ""}`}
                style={member === countryName ? { borderColor: info.color, color: info.color } : {}}
              >
                {member}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllianceDashboard;
