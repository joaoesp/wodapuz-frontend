import { describe, it, expect } from "vitest";
import { getCountryCode } from "./countryNameToCode";

describe("getCountryCode", () => {
  describe("major countries", () => {
    it("should return correct ISO-3 codes for major countries", () => {
      expect(getCountryCode("United States")).toBe("USA");
      expect(getCountryCode("China")).toBe("CHN");
      expect(getCountryCode("Brazil")).toBe("BRA");
      expect(getCountryCode("India")).toBe("IND");
      expect(getCountryCode("Germany")).toBe("DEU");
      expect(getCountryCode("United Kingdom")).toBe("GBR");
      expect(getCountryCode("Japan")).toBe("JPN");
      expect(getCountryCode("France")).toBe("FRA");
    });
  });

  describe("abbreviated names", () => {
    it("should handle countries with abbreviated names", () => {
      expect(getCountryCode("Bosnia and Herz.")).toBe("BIH");
      expect(getCountryCode("Dominican Rep.")).toBe("DOM");
      expect(getCountryCode("Eq. Guinea")).toBe("GNQ");
      expect(getCountryCode("Central African Rep.")).toBe("CAF");
    });
  });

  describe("special characters", () => {
    it("should handle countries with special characters in names", () => {
      expect(getCountryCode("Côte d'Ivoire")).toBe("CIV");
    });
  });

  describe("unknown countries", () => {
    it("should return null for unknown/invalid country names", () => {
      expect(getCountryCode("Atlantis")).toBeNull();
      expect(getCountryCode("Narnia")).toBeNull();
      expect(getCountryCode("")).toBeNull();
      expect(getCountryCode("Random Country XYZ")).toBeNull();
    });
  });

  describe("case sensitivity", () => {
    it("should be case-sensitive", () => {
      expect(getCountryCode("United States")).toBe("USA");
      expect(getCountryCode("united states")).toBeNull(); // lowercase
      expect(getCountryCode("UNITED STATES")).toBeNull(); // uppercase
    });
  });

  describe("edge cases", () => {
    it("should handle Greenland correctly", () => {
      expect(getCountryCode("Greenland")).toBe("GRL");
    });

    it("should handle Palestine correctly", () => {
      expect(getCountryCode("Palestine")).toBe("PSE");
    });

    it("should return null for Somaliland (no ISO code)", () => {
      expect(getCountryCode("Somaliland")).toBeNull();
    });
  });
});
