import type { AICandidateDTO } from "../../types";

interface GuestState {
  sourceText?: string;
  sourceHash?: string;
  candidates?: AICandidateDTO[];
}

const GUEST_STATE_KEY = "ai-flashcards-guest-state";

/**
 * Loads the guest state from sessionStorage
 * @returns The guest state or an empty object if no state exists
 */
export function loadGuestState(): GuestState {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const storedState = sessionStorage.getItem(GUEST_STATE_KEY);
    if (!storedState) {
      return {};
    }

    return JSON.parse(storedState) as GuestState;
  } catch (error) {
    console.error("Failed to load guest state from sessionStorage:", error);
    return {};
  }
}

/**
 * Saves the guest state to sessionStorage
 * @param state The state to save
 */
export function saveGuestState(state: GuestState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(GUEST_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save guest state to sessionStorage:", error);
  }
}

/**
 * Clears the guest state from sessionStorage
 */
export function clearGuestState(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem(GUEST_STATE_KEY);
  } catch (error) {
    console.error("Failed to clear guest state from sessionStorage:", error);
  }
}
