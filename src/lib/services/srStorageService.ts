import { StorageError } from "../errors/reviewErrors";
import type { SRCardState } from "./srService";

const SR_STATE_KEY = "flashcards_sr_state";

interface SRState {
  cards: Record<string, SRCardState>;
  lastSync?: string;
}

export class SRStorageService {
  loadState(): SRState {
    try {
      const savedState = localStorage.getItem(SR_STATE_KEY);
      if (!savedState) {
        return { cards: {} };
      }
      return JSON.parse(savedState);
    } catch (_error) {
      throw new StorageError("Failed to load SR state from local storage. Your progress may be reset.");
    }
  }

  saveState(state: SRState): void {
    try {
      localStorage.setItem(
        SR_STATE_KEY,
        JSON.stringify({
          ...state,
          lastSync: new Date().toISOString(),
        })
      );
    } catch (_error) {
      throw new StorageError("Failed to save SR state to local storage. Your progress may not be saved.");
    }
  }

  getCardState(cardId: string): SRCardState | undefined {
    try {
      const state = this.loadState();
      return state.cards[cardId];
    } catch (_error) {
      throw new StorageError("Failed to load card state from local storage.");
    }
  }

  updateCardState(cardId: string, cardState: SRCardState): void {
    try {
      const state = this.loadState();
      state.cards[cardId] = cardState;
      this.saveState(state);
    } catch (_error) {
      throw new StorageError("Failed to save card state to local storage.");
    }
  }

  clearState(): void {
    try {
      localStorage.removeItem(SR_STATE_KEY);
    } catch (_error) {
      throw new StorageError("Failed to clear SR state from local storage.");
    }
  }
}
