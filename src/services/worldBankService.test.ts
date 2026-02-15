import { describe, it, expect, beforeEach, vi } from "vitest";
import { worldBankService } from "./worldBankService";

// Mock fetch globally
global.fetch = vi.fn();

describe("worldBankService", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe("getIndicatorYearRange", () => {
    it("should fetch from correct endpoint for GDP", async () => {
      const mockResponse = {
        "2024": [
          {
            countryCode: "USA",
            countryName: "United States",
            year: "2024",
            value: 25000000000000,
            indicator: "GDP",
          },
        ],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await worldBankService.getIndicatorYearRange("GDP", 2020, 2024);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:1337/api/world-bank/gdp/years/2020/2024"
      );
    });

    it("should fetch from correct endpoint for GDP growth", async () => {
      const mockResponse = { "2024": [] };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await worldBankService.getIndicatorYearRange("GDP growth", 2020, 2024);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:1337/api/world-bank/gdp-growth/years/2020/2024"
      );
    });

    it("should map all indicator names to correct slugs", async () => {
      const indicators = [
        { name: "GDP", slug: "gdp" },
        { name: "GDP growth", slug: "gdp-growth" },
        { name: "GDP per capita", slug: "gdp-per-capita" },
        { name: "Debt-to-GDP", slug: "debt-to-gdp" },
        { name: "Inflation", slug: "inflation" },
        { name: "Current Account Balance", slug: "current-account-balance" },
      ];

      for (const indicator of indicators) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

        await worldBankService.getIndicatorYearRange(indicator.name, 2020, 2024);

        expect(fetch).toHaveBeenCalledWith(
          `http://localhost:1337/api/world-bank/${indicator.slug}/years/2020/2024`
        );

        vi.clearAllMocks();
      }
    });

    it("should throw error for unknown indicator", async () => {
      await expect(
        worldBankService.getIndicatorYearRange("UnknownMetric", 2020, 2024)
      ).rejects.toThrow("Unknown indicator: UnknownMetric");

      // Fetch should not have been called
      expect(fetch).not.toHaveBeenCalled();
    });

    it("should handle fetch errors", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      await expect(worldBankService.getIndicatorYearRange("GDP", 2020, 2024)).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle HTTP error responses", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
      });

      await expect(worldBankService.getIndicatorYearRange("GDP", 2020, 2024)).rejects.toThrow(
        "Failed to fetch GDP year range: Internal Server Error"
      );
    });

    it("should return data in correct format", async () => {
      const mockResponse = {
        "2024": [
          {
            countryCode: "USA",
            countryName: "United States",
            year: "2024",
            value: 25000000000000,
            indicator: "GDP",
          },
          {
            countryCode: "CHN",
            countryName: "China",
            year: "2024",
            value: 18000000000000,
            indicator: "GDP",
          },
        ],
        "2023": [
          {
            countryCode: "USA",
            countryName: "United States",
            year: "2023",
            value: 24000000000000,
            indicator: "GDP",
          },
        ],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await worldBankService.getIndicatorYearRange("GDP", 2020, 2024);

      expect(result).toEqual(mockResponse);
      expect(result["2024"]).toHaveLength(2);
      expect(result["2023"]).toHaveLength(1);
    });
  });
});
