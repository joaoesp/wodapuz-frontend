import { describe, it, expect } from "vitest";
import { METRIC_CONFIGS, getColorFromThresholds } from "./WorldMap";

describe("getColorFromThresholds", () => {
  const thresholds = [-5, 0, 2, 5, 8];
  const colors = ["#red", "#yellow", "#lightyellow", "#lightgreen", "#green", "#darkgreen"];

  it("should return first color for values below first threshold", () => {
    expect(getColorFromThresholds(-10, thresholds, colors)).toBe("#red");
    expect(getColorFromThresholds(-6, thresholds, colors)).toBe("#red");
  });

  it("should return correct color for values within thresholds", () => {
    expect(getColorFromThresholds(-3, thresholds, colors)).toBe("#yellow");
    expect(getColorFromThresholds(1, thresholds, colors)).toBe("#lightyellow");
    expect(getColorFromThresholds(3, thresholds, colors)).toBe("#lightgreen");
    expect(getColorFromThresholds(6, thresholds, colors)).toBe("#green");
  });

  it("should return last color for values above highest threshold", () => {
    expect(getColorFromThresholds(10, thresholds, colors)).toBe("#darkgreen");
    expect(getColorFromThresholds(100, thresholds, colors)).toBe("#darkgreen");
  });

  it("should handle exact threshold values correctly", () => {
    expect(getColorFromThresholds(-5, thresholds, colors)).toBe("#red");
    expect(getColorFromThresholds(0, thresholds, colors)).toBe("#yellow");
    expect(getColorFromThresholds(2, thresholds, colors)).toBe("#lightyellow");
    expect(getColorFromThresholds(5, thresholds, colors)).toBe("#lightgreen");
    expect(getColorFromThresholds(8, thresholds, colors)).toBe("#green");
  });
});

describe("METRIC_CONFIGS", () => {
  describe("GDP configuration", () => {
    const gdpConfig = METRIC_CONFIGS["GDP"];

    it("should have correct number of colors for thresholds", () => {
      expect(gdpConfig.colors.length).toBe(gdpConfig.thresholds.length + 1);
    });

    it("should format trillions correctly", () => {
      expect(gdpConfig.format(1_000_000_000_000)).toBe("GDP: $1.00T");
      expect(gdpConfig.format(15_500_000_000_000)).toBe("GDP: $15.50T");
    });

    it("should format billions correctly", () => {
      expect(gdpConfig.format(500_000_000_000)).toBe("GDP: $500B");
      expect(gdpConfig.format(45_000_000_000)).toBe("GDP: $45B");
    });

    it("should have ascending thresholds", () => {
      for (let i = 1; i < gdpConfig.thresholds.length; i++) {
        expect(gdpConfig.thresholds[i]).toBeGreaterThan(gdpConfig.thresholds[i - 1]);
      }
    });
  });

  describe("GDP growth configuration", () => {
    const growthConfig = METRIC_CONFIGS["GDP growth"];

    it("should format positive growth correctly", () => {
      expect(growthConfig.format(5.2)).toBe("GDP growth: 5.2%");
      expect(growthConfig.format(0.5)).toBe("GDP growth: 0.5%");
    });

    it("should format negative growth correctly", () => {
      expect(growthConfig.format(-2.3)).toBe("GDP growth: -2.3%");
      expect(growthConfig.format(-0.8)).toBe("GDP growth: -0.8%");
    });

    it("should have correct color array length", () => {
      expect(growthConfig.colors.length).toBe(growthConfig.thresholds.length + 1);
    });
  });

  describe("GDP per capita configuration", () => {
    const perCapitaConfig = METRIC_CONFIGS["GDP per capita"];

    it("should format values with thousand separators", () => {
      expect(perCapitaConfig.format(50000)).toBe("GDP per capita: $50,000");
      expect(perCapitaConfig.format(1234)).toBe("GDP per capita: $1,234");
    });

    it("should not show decimal places", () => {
      expect(perCapitaConfig.format(1234.56)).toBe("GDP per capita: $1,235"); // Rounded
    });
  });

  describe("Debt-to-GDP configuration", () => {
    const debtConfig = METRIC_CONFIGS["Debt-to-GDP"];

    it("should format percentage with one decimal", () => {
      expect(debtConfig.format(75.5)).toBe("Debt-to-GDP: 75.5%");
      expect(debtConfig.format(120.2)).toBe("Debt-to-GDP: 120.2%");
    });
  });

  describe("Inflation configuration", () => {
    const inflationConfig = METRIC_CONFIGS["Inflation"];

    it("should format inflation rate correctly", () => {
      expect(inflationConfig.format(2.5)).toBe("Inflation: 2.5%");
      expect(inflationConfig.format(-1.2)).toBe("Inflation: -1.2%");
    });
  });

  describe("Current Account Balance configuration", () => {
    const currentAccountConfig = METRIC_CONFIGS["Current Account Balance"];

    it("should format with % of GDP suffix", () => {
      expect(currentAccountConfig.format(5.3)).toBe("Current Account: 5.3% of GDP");
      expect(currentAccountConfig.format(-3.7)).toBe("Current Account: -3.7% of GDP");
    });
  });

  describe("all metrics", () => {
    it("should have all 6 expected metrics", () => {
      const expectedMetrics = [
        "GDP",
        "GDP growth",
        "GDP per capita",
        "Debt-to-GDP",
        "Inflation",
        "Current Account Balance",
      ];

      expectedMetrics.forEach((metric) => {
        expect(METRIC_CONFIGS[metric]).toBeDefined();
      });
    });

    it("should have ascending thresholds for all metrics", () => {
      Object.entries(METRIC_CONFIGS).forEach(([name, config]) => {
        for (let i = 1; i < config.thresholds.length; i++) {
          expect(config.thresholds[i]).toBeGreaterThan(config.thresholds[i - 1]);
        }
      });
    });

    it("should have correct color array length for all metrics", () => {
      Object.entries(METRIC_CONFIGS).forEach(([name, config]) => {
        expect(config.colors.length).toBe(config.thresholds.length + 1);
      });
    });
  });
});
