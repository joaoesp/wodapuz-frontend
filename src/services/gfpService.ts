const API_BASE_URL = "http://localhost:1337/api";

export interface GfpRanking {
  countryCode: string;
  powerIndex: number;
  rank: number;
}

export interface GfpCountryDetail {
  airPower: {
    totalAircraft: number | null;
    fighters: number | null;
    attackAircraft: number | null;
    helicopters: number | null;
    attackHelicopters: number | null;
  };
  landForces: {
    tanks: number | null;
    armoredVehicles: number | null;
    selfPropelledArtillery: number | null;
    towedArtillery: number | null;
    rocketArtillery: number | null;
  };
  navalForces: {
    totalAssets: number | null;
    totalTonnage: number | null;
    carriers: number | null;
    destroyers: number | null;
    frigates: number | null;
    submarines: number | null;
    corvettes: number | null;
  };
  manpower: {
    army: number | null;
    airForce: number | null;
    navy: number | null;
  };
}

export const gfpService = {
  async fetchRankings(): Promise<GfpRanking[]> {
    const response = await fetch(`${API_BASE_URL}/gfp/rankings`);
    if (!response.ok) {
      throw new Error(`Failed to fetch GFP rankings: ${response.statusText}`);
    }
    return response.json();
  },

  async fetchCountryDetail(iso3: string): Promise<GfpCountryDetail> {
    const response = await fetch(`${API_BASE_URL}/gfp/country/${iso3}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch GFP detail for ${iso3}: ${response.statusText}`);
    }
    return response.json();
  },
};
