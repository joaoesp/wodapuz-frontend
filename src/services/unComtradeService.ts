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

export interface EnergyTradeData {
  partners: TradePartner[];
  flow: string;
  year: number;
  iso3: string;
}

export interface TradeData {
  partners: TradePartner[];
  products: TradeProduct[];
  total: number;
  flow: string;
  year: number;
  iso3: string;
}

export interface TradePartnerProducts {
  products: TradeProduct[];
  flow: string;
  year: number;
  iso3: string;
  partnerIso3: string;
}

export interface EnergyPartnerBreakdown {
  products: TradeProduct[];
  flow: string;
  year: number;
  iso3: string;
  partnerIso3: string;
}

export interface EnergyTypeBreakdown {
  products: TradeProduct[];
  flow: string;
  year: number;
  iso3: string;
}

export interface EnergyTypePartnersData {
  partners: TradePartner[];
  worldTotal: number;
  hs4Code: string;
  flow: string;
  year: number;
  iso3: string;
}

export interface ProductHistory {
  history: { year: number; value: number }[];
  hsCode: string;
  flow: string;
  iso3: string;
  partnerIso3: string;
}

export const unComtradeService = {
  async getEnergyTradeData(iso3: string, flow: "X" | "M", year: number): Promise<EnergyTradeData> {
    const response = await fetch(`${API_BASE_URL}/un-comtrade/${iso3}/${flow}/${year}/energy`);
    if (!response.ok) throw new Error(`Failed to fetch energy trade data: ${response.statusText}`);
    return response.json();
  },

  async getTradeData(iso3: string, flow: "X" | "M", year: number): Promise<TradeData> {
    const response = await fetch(`${API_BASE_URL}/un-comtrade/${iso3}/${flow}/${year}`);
    if (!response.ok) throw new Error(`Failed to fetch trade data: ${response.statusText}`);
    return response.json();
  },

  async getPartnerProducts(
    iso3: string,
    partnerIso3: string,
    flow: "X" | "M",
    year: number
  ): Promise<TradePartnerProducts> {
    const response = await fetch(
      `${API_BASE_URL}/un-comtrade/${iso3}/${flow}/${year}/partner/${partnerIso3}`
    );
    if (!response.ok) throw new Error(`Failed to fetch partner products: ${response.statusText}`);
    return response.json();
  },

  async getEnergyTypeBreakdown(
    iso3: string,
    flow: "X" | "M",
    year: number
  ): Promise<EnergyTypeBreakdown> {
    const response = await fetch(
      `${API_BASE_URL}/un-comtrade/${iso3}/${flow}/${year}/energy/types`
    );
    if (!response.ok)
      throw new Error(`Failed to fetch energy type breakdown: ${response.statusText}`);
    return response.json();
  },

  async getEnergyTypePartners(
    iso3: string,
    hs4Code: string,
    flow: "X" | "M",
    year: number
  ): Promise<EnergyTypePartnersData> {
    const response = await fetch(
      `${API_BASE_URL}/un-comtrade/${iso3}/${flow}/${year}/energy/${hs4Code}/partners`
    );
    if (!response.ok)
      throw new Error(`Failed to fetch energy type partners: ${response.statusText}`);
    return response.json();
  },

  async getEnergyPartnerBreakdown(
    iso3: string,
    partnerIso3: string,
    flow: "X" | "M",
    year: number
  ): Promise<EnergyPartnerBreakdown> {
    const response = await fetch(
      `${API_BASE_URL}/un-comtrade/${iso3}/${flow}/${year}/energy/partner/${partnerIso3}`
    );
    if (!response.ok)
      throw new Error(`Failed to fetch energy partner breakdown: ${response.statusText}`);
    return response.json();
  },

  async getProductHistory(
    iso3: string,
    partnerIso3: string,
    flow: "X" | "M",
    hsCode: string
  ): Promise<ProductHistory> {
    const response = await fetch(
      `${API_BASE_URL}/un-comtrade/${iso3}/${flow}/partner/${partnerIso3}/product/${hsCode}`
    );
    if (!response.ok) throw new Error(`Failed to fetch product history: ${response.statusText}`);
    return response.json();
  },
};
