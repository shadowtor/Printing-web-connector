import { afterAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app.js";

const app = buildApp();

describe("health routes", () => {
  afterAll(async () => {
    await app.close();
  });

  it("returns liveness", async () => {
    const response = await app.inject({ method: "GET", url: "/health/live" });
    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe("ok");
  });

  it("returns readiness", async () => {
    const response = await app.inject({ method: "GET", url: "/health/ready" });
    expect([200, 503]).toContain(response.statusCode);
    expect(["ready", "not-ready"]).toContain(response.json().status as string);
  });
});
