const API_BASE_URL = "http://localhost:1337/api";

export interface TradePartner {
  name: string;
  iso: string;
  value: number;
}

export interface TradeProduct {
  code: string;
  name: string;
  value: number;
}

export interface TradeData {
  partners: TradePartner[];
  products: TradeProduct[];
  total: number;
  flow: string;
  year: number;
  iso3: string;
}

export const unComtradeService = {
  async getTradeData(iso3: string, flow: "X" | "M", year: number): Promise<TradeData> {
    const response = await fetch(`${API_BASE_URL}/un-comtrade/${iso3}/${flow}/${year}`);
    if (!response.ok) throw new Error(`Failed to fetch trade data: ${response.statusText}`);
    return response.json();
  },
};
