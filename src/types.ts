// API Response Types
export interface ApiErrorResponseDto {
  message: string;
  code?: string;
  details?: unknown;
}

export interface GenerateAiCandidatesResponseDto {
  data: AICandidateDTO[];
}

export interface GenerateFlashcardCandidatesCommand {
  sourceText: string;
}

export interface UpdateAICandidateCommand {
  front_text: string;
  back_text: string;
}

// Domain DTOs
export interface AICandidateDTO {
  id: string;
  front_text: string;
  back_text: string;
  source_text_hash: string;
  created_at: string;
  updated_at: string;
}

export interface FlashcardDTO {
  id: string;
  front_text: string;
  back_text: string;
  source: string;
  created_at: string;
  updated_at: string;
}
