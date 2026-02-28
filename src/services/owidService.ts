const API_BASE_URL = "http://localhost:1337/api";

export interface CountryEnergyData {
  years: number[];
  total: (number | null)[];
  coal: (number | null)[];
  gas: (number | null)[];
  oil: (number | null)[];
  nuclear: (number | null)[];
  hydro: (number | null)[];
  solar: (number | null)[];
  wind: (number | null)[];
  biofuel: (number | null)[];
}

export const owidService = {
  async fetchEnergyYearRange(
    startYear: number,
    endYear: number
  ): Promise<
    Record<
      string,
      { countryCode: string; countryName: string; year: string; value: number; indicator: string }[]
    >
  > {
    const response = await fetch(`${API_BASE_URL}/owid/energy/years/${startYear}/${endYear}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch energy data: ${response.statusText}`);
    }
    return response.json();
  },

  async fetchCountryEnergy(iso3: string): Promise<CountryEnergyData> {
    const response = await fetch(`${API_BASE_URL}/owid/energy/country/${iso3}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch energy data for ${iso3}: ${response.statusText}`);
    }
    return response.json();
  },
};
