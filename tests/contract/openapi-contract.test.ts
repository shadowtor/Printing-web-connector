import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("OpenAPI contract presence", () => {
  it("has connector OpenAPI contract checked in", () => {
    const path = "specs/002-bambu-connector-service/contracts/connector-openapi.yaml";
    expect(existsSync(path)).toBe(true);
  });
});
