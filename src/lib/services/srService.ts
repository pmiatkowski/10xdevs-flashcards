import { SRAlgorithmError } from "../errors/reviewErrors";

export interface SRCardState {
  cardId: string;
  dueDate: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export interface SROptions {
  minEaseFactor?: number; // Minimum ease factor, default 1.3
  maxEaseFactor?: number; // Maximum ease factor, default 3.0
  hardFactor?: number; // Multiplier for hard responses, default 1.2
  easyBonus?: number; // Extra multiplier for easy responses, default 1.3
  easeChange?: number; // How much to change ease factor, default 0.15
}

const defaultOptions: Required<SROptions> = {
  minEaseFactor: 1.3,
  maxEaseFactor: 3.0,
  hardFactor: 1.2,
  easyBonus: 1.3,
  easeChange: 0.15,
};

export class SRService {
  private options: Required<SROptions>;

  constructor(options: SROptions = {}) {
    this.options = { ...defaultOptions, ...options };
  }

  calculateNextReview(rating: number, currentState?: Partial<SRCardState>): SRCardState {
    try {
      if (rating < 1 || rating > 3) {
        throw new SRAlgorithmError("Invalid rating. Must be between 1 and 3.");
      }

      const now = new Date();
      const base = currentState?.interval ?? 1;
      const ease = currentState?.easeFactor ?? 2.5;

      let nextInterval: number;
      let newEase = ease;

      switch (rating) {
        case 1: // Hard
          nextInterval = Math.max(1, Math.floor(base * this.options.hardFactor));
          newEase = Math.max(this.options.minEaseFactor, ease - this.options.easeChange);
          break;
        case 2: // Good
          nextInterval = Math.floor(base * ease);
          break;
        case 3: // Easy
          nextInterval = Math.floor(base * ease * this.options.easyBonus);
          newEase = Math.min(this.options.maxEaseFactor, ease + this.options.easeChange);
          break;
        default:
          nextInterval = 1;
      }

      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + nextInterval);

      return {
        cardId: currentState?.cardId ?? "",
        dueDate: dueDate.toISOString(),
        interval: nextInterval,
        easeFactor: newEase,
        repetitions: (currentState?.repetitions ?? 0) + 1,
      };
    } catch (error) {
      throw new SRAlgorithmError(error instanceof Error ? error.message : "Failed to calculate next review");
    }
  }

  isDue(cardState?: SRCardState): boolean {
    if (!cardState) return true;
    return new Date(cardState.dueDate) <= new Date();
  }

  getStats(cardState?: SRCardState) {
    if (!cardState) {
      return {
        isNew: true,
        daysUntilReview: 0,
        totalReviews: 0,
      };
    }

    const now = new Date();
    const dueDate = new Date(cardState.dueDate);
    const daysUntilReview = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      isNew: false,
      daysUntilReview: Math.max(0, daysUntilReview),
      totalReviews: cardState.repetitions,
    };
  }
}
