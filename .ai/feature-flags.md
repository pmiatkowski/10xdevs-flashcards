# Feature Flags Implementation Plan

## 1. Cel

Rozdzielenie procesu deploymentu od release’u przy użyciu systemu feature flag w aplikacji AI Flashcards.

## 2. Środowiska

- local
- integration
- prod (production)

Środowisko wybierane przez zmienną `ENV_TYPE`.

## 3. Konfiguracja flag

W pliku `.ai/feature-flags.md` definiujemy statyczny obiekt:

```ts
export type Env = "local" | "integration" | "prod";
export type FeatureName = "settings";

export const flagConfig: Record<Env, Record<FeatureName, boolean>> = {
  local: {
    settings: true,
  },
  integration: {
    settings: false,
  },
  prod: {
    settings: false,
  },
};
```

## 4. Wybór środowiska

```ts
const rawEnv = (import.meta.env.ENV_TYPE ?? "local") as string;
export const ENV: Env = ["local", "integration", "prod"].includes(rawEnv)
  ? (rawEnv as Env)
  : "local";
```

## 5. Helper do sprawdzania flag

```ts
export function isFeatureEnabled(feature: FeatureName): boolean {
  return flagConfig[ENV][feature] ?? false;
}
```

## 6. Użycie w kodzie

W plikach Astro/React:

```ts
import { isFeatureEnabled } from "src/lib/featureFlags";

if (isFeatureEnabled("settings")) {
  // renderuj sekcję ustawień
}
```

## 7. Kolejne kroki

1. Integracja z plikiem `settings.astro` i kolejnymi modułami.
2. Walidacja podczas buildu.
3. Testy jednostkowe dla helpera i konfiguracji.
