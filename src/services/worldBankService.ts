const API_BASE_URL = 'http://localhost:1337/api';

export interface GDPData {
  countryCode: string;
  countryName: string;
  year: string;
  value: number;
  indicator: string;
}

export const worldBankService = {
  async getGDP(year?: string): Promise<GDPData[]> {
    try {
      const url = year
        ? `${API_BASE_URL}/world-bank/gdp?year=${year}`
        : `${API_BASE_URL}/world-bank/gdp`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch GDP data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching GDP data:', error);
      throw error;
    }
  },

  async getGDPYearRange(startYear: number, endYear: number): Promise<Record<string, GDPData[]>> {
    try {
      const url = `${API_BASE_URL}/world-bank/gdp/years/${startYear}/${endYear}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch GDP year range: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching GDP year range:', error);
      throw error;
    }
  },

  async getCountryGDP(countryCode: string, year?: string): Promise<GDPData | null> {
    try {
      const url = year
        ? `${API_BASE_URL}/world-bank/gdp/${countryCode}?year=${year}`
        : `${API_BASE_URL}/world-bank/gdp/${countryCode}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch GDP data for ${countryCode}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching GDP data for ${countryCode}:`, error);
      throw error;
    }
  },
};
