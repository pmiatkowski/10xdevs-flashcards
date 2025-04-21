import { describe, expect, test, vi, beforeEach } from "vitest";
import { isFeatureEnabled, ENV, type FeatureName, flagConfig } from "../featureFlags";

describe("Feature Flags", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  test.each([
    { env: "local", feature: "settings" },
    { env: "integration", feature: "settings" },
    { env: "prod", feature: "settings" },
  ])("isFeatureEnabled returns correct value for $feature in $env environment", ({ env, feature }) => {
    // Mock the environment
    process.env.ENV_TYPE = env;

    // Get the expected value dynamically from the config
    const expected = flagConfig[env as keyof typeof flagConfig][feature as FeatureName];

    // Test that isFeatureEnabled returns the value from the config
    expect(isFeatureEnabled(feature as FeatureName)).toBe(expected);
  });

  test("defaults to local environment when ENV_TYPE is invalid", () => {
    process.env.ENV_TYPE = "invalid_env";
    expect(ENV).toBe("local");
  });

  test("defaults to local environment when ENV_TYPE is not set", () => {
    delete process.env.ENV_TYPE;
    expect(ENV).toBe("local");
  });

  test("returns false for undefined feature flag", () => {
    expect(isFeatureEnabled("nonexistent" as FeatureName)).toBe(false);
  });
});
