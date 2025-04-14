import type { AICandidateDTO } from "../../types";

const STORAGE_KEYS = {
  SOURCE_TEXT: "fiszki:guest:sourceText",
  CANDIDATES: "fiszki:guest:candidates",
} as const;

export interface GuestStorage {
  sourceText?: string;
  candidates?: AICandidateDTO[];
}

/**
 * Saves guest state to sessionStorage
 */
export function saveGuestState(state: GuestStorage): void {
  if (state.sourceText) {
    sessionStorage.setItem(STORAGE_KEYS.SOURCE_TEXT, state.sourceText);
  }
  if (state.candidates) {
    sessionStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(state.candidates));
  }
}

/**
 * Loads guest state from sessionStorage
 */
export function loadGuestState(): GuestStorage {
  try {
    const sourceText = sessionStorage.getItem(STORAGE_KEYS.SOURCE_TEXT) || undefined;
    const candidatesJson = sessionStorage.getItem(STORAGE_KEYS.CANDIDATES);
    const candidates = candidatesJson ? JSON.parse(candidatesJson) : undefined;

    return { sourceText, candidates };
  } catch (error) {
    console.error("Failed to load guest state:", error);
    return {};
  }
}

/**
 * Clears guest state from sessionStorage
 */
export function clearGuestState(): void {
  sessionStorage.removeItem(STORAGE_KEYS.SOURCE_TEXT);
  sessionStorage.removeItem(STORAGE_KEYS.CANDIDATES);
}
