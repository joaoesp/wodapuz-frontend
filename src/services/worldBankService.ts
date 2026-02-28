const API_BASE_URL = "http://localhost:1337/api";

export interface IndicatorData {
  countryCode: string;
  countryName: string;
  year: string;
  value: number;
  indicator: string;
}

const INDICATOR_SLUGS: Record<string, string> = {
  GDP: "gdp",
  "GDP growth": "gdp-growth",
  "GDP per capita": "gdp-per-capita",
  "Debt-to-GDP": "debt-to-gdp",
  Inflation: "inflation",
  "Current Account Balance": "current-account-balance",
  "Trade Openness": "trade-openness",
  Exports: "exports",
  Imports: "imports",
  "Trade Balance": "trade-balance",
  "Military Spending": "defense-spending",
  "Active Personnel": "active-personnel",
  "Net Energy Balance": "net-energy-balance",
};

export const worldBankService = {
  async getIndicatorYearRange(
    indicator: string,
    startYear: number,
    endYear: number
  ): Promise<Record<string, IndicatorData[]>> {
    try {
      const indicatorSlug = INDICATOR_SLUGS[indicator];
      if (!indicatorSlug) {
        throw new Error(`Unknown indicator: ${indicator}`);
      }

      const url = `${API_BASE_URL}/world-bank/${indicatorSlug}/years/${startYear}/${endYear}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${indicator} year range: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${indicator} year range:`, error);
      throw error;
    }
  },
};
