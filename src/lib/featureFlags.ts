export type Env = "local" | "integration" | "prod";
export type FeatureName = "settings" | "forgot-password";

export const flagConfig: Record<Env, Record<FeatureName, boolean>> = {
  local: {
    settings: true,
    "forgot-password": false,
  },
  integration: {
    settings: true,
    "forgot-password": true,
  },
  prod: {
    settings: true,
    "forgot-password": false,
  },
} as const;

// Helper function to get environment, extracted for testability
export function getCurrentEnv(): Env {
  const rawEnv = (import.meta.env.PUBLIC_ENV_TYPE || import.meta.env.ENV_TYPE) ?? "local";
  return ["local", "integration", "prod"].includes(rawEnv) ? (rawEnv as Env) : "local";
}

// Expose current environment for middleware and other uses
export const ENV: Env = getCurrentEnv();

export function isFeatureEnabled(feature: FeatureName): boolean {
  const env = getCurrentEnv();
  return flagConfig[env]?.[feature] ?? false;
}
