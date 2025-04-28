# DashboardView Refactoring Plan using React Hook Form

## 1. Analysis

### Current Components & Functionality

- `DashboardView.tsx`: Main dashboard UI, displays flashcard sets
  - Handles flashcard generation through AI
  - Manages candidate state (editing, saving, validation)
  - Handles bulk actions (accept all)
  - Manages guest vs authenticated user states
  - Handles API interactions for flashcard operations

### Form-Related Logic

- AI Generation form (`AIGenerationForm` component)
- Candidate editing forms within the candidates list
- Validation logic for front/back text lengths
- Manual state management using useState and callbacks

### Areas of High Complexity

1. State Management:
   - Multiple pieces of state (candidates, editing, loading, errors)
   - Complex state updates with nested object structures
   - Guest vs authenticated user state handling

2. Form Handling:
   - Manual validation implementation
   - Multiple form states across candidates
   - Edit mode toggling and state preservation

3. API Interactions:
   - Multiple endpoints (generate, accept, reject, update)
   - Error handling and loading states
   - Guest state persistence and migration

## 2. Refactoring Plan

### 2.1 Component Structure Changes

1. Split into smaller components:

   ```
   DashboardView/
   ├── index.tsx
   ├── hooks/
   │   ├── useFlashcardGeneration.ts
   │   ├── useFlashcardCandidates.ts
   │   └── useGuestState.ts
   ├── components/
   │   ├── GenerationForm.tsx
   │   ├── CandidateList.tsx
   │   └── CandidateItem.tsx
   ```

2. Move form logic into dedicated components using React Hook Form:
   - Create `GenerationForm` with RHF integration
   - Each `CandidateItem` gets its own form context
   - Implement form-level validation using Zod

### 2.2 React Hook Form Implementation

1. Generation Form:

```typescript
// Form schema
const generationSchema = z.object({
  sourceText: z.string().min(1, "Please enter some text to generate flashcards")
});

type GenerationFormData = z.infer<typeof generationSchema>;

// Form component
const GenerationForm = () => {
  const form = useForm<GenerationFormData>({
    resolver: zodResolver(generationSchema)
  });
  
  // ... form implementation
};
```

2. Candidate Edit Form:

```typescript
const candidateSchema = z.object({
  front_text: z.string().max(200, "Front text must be 200 characters or less"),
  back_text: z.string().max(500, "Back text must be 500 characters or less")
});

type CandidateFormData = z.infer<typeof candidateSchema>;

// Form component
const CandidateForm = () => {
  const form = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema)
  });
  
  // ... form implementation
};
```

### 2.3 Logic Optimization

1. Custom Hooks:

   ```typescript
   // Generation hook
   const useFlashcardGeneration = () => {
     // ... generation logic
   };

   // Candidates management hook
   const useFlashcardCandidates = () => {
     // ... candidates state and operations
   };

   // Guest state management hook
   const useGuestState = () => {
     // ... guest state logic
   };
   ```

2. Form State Management:
   - Replace manual validation with Zod schemas
   - Use RHF's built-in error handling
   - Leverage form state for loading indicators
   - Use form context for nested form components

### 2.4 API Call Management

1. Create API service layer:

```typescript
// src/lib/services/flashcardService.ts
export class FlashcardService {
  static async generateCandidates(sourceText: string): Promise<AICandidateDTO[]>;
  static async acceptCandidate(id: string): Promise<FlashcardDTO>;
  static async rejectCandidate(id: string): Promise<void>;
  static async updateCandidate(id: string, data: UpdateAICandidateCommand): Promise<AICandidateDTO>;
  static async bulkAcceptCandidates(ids: string[]): Promise<FlashcardDTO[]>;
}
```

2. Error Handling:
   - Create custom error types
   - Implement consistent error responses
   - Add retry logic for transient failures

### 2.5 Testing Strategy

1. Unit Tests:

```typescript
// Component tests
describe('GenerationForm', () => {
  it('validates input correctly');
  it('handles submission properly');
  it('displays errors appropriately');
});

// Hook tests
describe('useFlashcardGeneration', () => {
  it('manages loading state correctly');
  it('handles successful generation');
  it('handles errors properly');
});
```

2. Integration Tests:

```typescript
describe('DashboardView', () => {
  it('handles guest user generation workflow');
  it('handles authenticated user generation workflow');
  it('manages candidate state correctly');
});
```

3. E2E Tests:

```typescript
test('complete flashcard generation workflow', async ({ page }) => {
  // Test full user journey
});
```

## Implementation Steps

1. Setup Dependencies:

   ```bash
   npm install react-hook-form @hookform/resolvers zod
   ```

2. Create New Files Structure
3. Implement Custom Hooks
4. Create Form Components with RHF
5. Implement Service Layer
6. Add Tests
7. Integrate Components
8. Verify Edge Cases
9. Add Error Boundaries
10. Performance Testing

## Migration Strategy

1. Implement changes in parallel structure
2. Add feature flags for new implementation
3. Gradual rollout to verify behavior
4. Monitor error rates and performance
5. Full cutover once stable
