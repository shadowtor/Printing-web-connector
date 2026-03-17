import { describe, expect, it } from "vitest";
import { PowerService } from "../../src/domain/costing/power.service.js";

describe("PowerService", () => {
  it("estimates kWh from duration and default wattage", () => {
    const service = new PowerService();
    expect(service.estimateKwh({ durationMinutes: 60 })).toBe(0.12);
  });
});
