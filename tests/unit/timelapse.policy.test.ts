import { describe, expect, it } from "vitest";
import { buildVisibilityPolicy } from "../../src/domain/timelapse/timelapse.policy.js";

describe("buildVisibilityPolicy", () => {
  it("always allows internal visibility", () => {
    expect(buildVisibilityPolicy(false, false).internalVisible).toBe(true);
  });

  it("allows customer visibility for successful attempts", () => {
    expect(buildVisibilityPolicy(true, false).customerVisible).toBe(true);
  });

  it("allows customer visibility when explicitly approved", () => {
    expect(buildVisibilityPolicy(false, true).customerVisible).toBe(true);
  });
});
