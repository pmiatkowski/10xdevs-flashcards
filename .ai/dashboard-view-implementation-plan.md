
# Plan implementacji widoku Panelu Głównego (Dashboard)

## 1. Przegląd

Panel Główny (Dashboard) jest centralnym widokiem aplikacji Fiszki AI dostępnym po zalogowaniu użytkownika. Jego głównym celem jest umożliwienie szybkiego generowania propozycji fiszek (kandydatów) na podstawie wklejonego tekstu przy użyciu AI oraz zarządzanie tymi kandydatami (przeglądanie, edycja, akceptacja, odrzucenie).

## 2. Routing widoku

Widok Panelu Głównego powinien być dostępny pod główną ścieżką aplikacji po zalogowaniu:

- Ścieżka: `/`
- Plik: `src/pages/index.astro`

## 3. Struktura komponentów

Widok będzie zaimplementowany z wykorzystaniem Astro dla strony i React dla części interaktywnych. Główna struktura komponentów React będzie następująca:

```

DashboardPage.astro (`src/pages/index.astro`)
└── DashboardView.tsx (Główny kontener React)
    ├── AIGenerationForm.tsx (Formularz generowania)
    │   ├── Textarea (Shadcn/ui - pole na tekst źródłowy)
    │   └── Button (Shadcn/ui - przycisk "Generuj")
    └── AICandidateList.tsx (Lista kandydatów)
        ├── Button (Shadcn/ui - przycisk "Akceptuj Wszystkie")
        └── AICandidateListItem.tsx (Element listy - mapowany z tablicy kandydatów)
            ├── Ikona "@"
            ├── Div (wyświetlanie przodu/tyłu) LUB:
            │   ├── Textarea (Shadcn/ui - edycja przodu) + Licznik znaków
            │   └── Textarea (Shadcn/ui - edycja tyłu) + Licznik znaków
            ├── Button (Shadcn/ui - "Edytuj")
            ├── Button (Shadcn/ui - "Akceptuj")
            ├── Button (Shadcn/ui - "Odrzuć")
            ├── Button (Shadcn/ui - "Zapisz zmiany") // W trybie edycji
            └── Button (Shadcn/ui - "Anuluj") // W trybie edycji

```

Komponenty React (`DashboardView`, `AIGenerationForm`, `AICandidateList`, `AICandidateListItem`) zostaną umieszczone w katalogu `src/components/`.

## 4. Szczegóły komponentów

### `DashboardPage.astro` (`src/pages/index.astro`)

- **Opis:** Główny plik strony Astro dla ścieżki `/`. Renderuje `Layout.astro` i osadza główny komponent React (`DashboardView`). Odpowiedzialny za przekazanie ewentualnych danych inicjalnych (jeśli będą potrzebne w przyszłości) i ustawienie metadanych strony.
- **Główne elementy:** `<Layout>`, `<DashboardView client:load />` (lub inna dyrektywa kliencka Astro).
- **Obsługiwane interakcje:** Brak bezpośrednich.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych.
- **Propsy:** Brak.

### `DashboardView.tsx` (`src/components/DashboardView.tsx`)

- **Opis:** Główny kontener React dla widoku Dashboard. Zarządza stanem całego widoku, w tym listą kandydatów, stanami ładowania, błędami oraz obsługuje logikę wywołań API inicjowanych przez komponenty podrzędne.
- **Główne elementy:** Renderuje `<AIGenerationForm />` i `<AICandidateList />`. Wykorzystuje hook `useToast` z Shadcn/ui do wyświetlania powiadomień.
- **Obsługiwane interakcje:**
  - `handleGenerate(sourceText: string)`: Wywołuje API generowania.
  - `handleAccept(candidateId: string)`: Wywołuje API akceptacji.
  - `handleReject(candidateId: string)`: Wywołuje API odrzucenia.
  - `handleEditToggle(candidateId: string, isEditing: boolean)`: Przełącza tryb edycji dla kandydata.
  - `handleEditChange(candidateId: string, field: 'front' | 'back', value: string)`: Aktualizuje tymczasową wartość edytowanego pola.
  - `handleSaveEdit(candidateId: string)`: Wywołuje API aktualizacji kandydata.
  - `handleAcceptAll()`: Wywołuje API akceptacji dla wszystkich kandydatów.
- **Obsługiwana walidacja:** Pośrednio, poprzez przekazywanie błędów walidacji (otrzymanych z API lub walidacji w `AICandidateListItem`) do stanu i potencjalnie wyświetlanie ich w `Toast`.
- **Typy:** `AICandidateViewModel[]`, `ApiErrorResponseDto`, `GenerateFlashcardCandidatesCommand`, `UpdateAICandidateCommand`.
- **Propsy:** Brak.

### `AIGenerationForm.tsx` (`src/components/AIGenerationForm.tsx`)

- **Opis:** Komponent formularza do wprowadzania tekstu źródłowego i inicjowania generowania fiszek AI.
- **Główne elementy:** `Textarea` (Shadcn/ui) dla tekstu źródłowego, `Button` (Shadcn/ui) "Generuj". Może zawierać wskaźnik ładowania.
- **Obsługiwane interakcje:** Wprowadzanie tekstu, kliknięcie przycisku "Generuj".
- **Obsługiwana walidacja:** Opcjonalnie: prosta walidacja po stronie klienta (np. czy pole nie jest puste) przed wywołaniem `onSubmit`.
- **Typy:** Brak specyficznych.
- **Propsy:**
  - `onSubmit: (sourceText: string) => void`: Funkcja wywoływana po kliknięciu "Generuj".
  - `isLoading: boolean`: Wskazuje, czy trwa proces generowania.

### `AICandidateList.tsx` (`src/components/AICandidateList.tsx`)

- **Opis:** Komponent wyświetlający listę kandydatów na fiszki (`AICandidateListItem`) oraz przycisk do akceptacji wszystkich.
- **Główne elementy:** `Button` (Shadcn/ui) "Akceptuj Wszystkie", lista elementów `AICandidateListItem` renderowana za pomocą `.map()`.
- **Obsługiwane interakcje:** Kliknięcie przycisku "Akceptuj Wszystkie".
- **Obsługiwana walidacja:** Brak bezpośredniej. Sprawdza, czy istnieją kandydaci do wyświetlenia. Wyłącza przycisk "Akceptuj Wszystkie", jeśli którykolwiek kandydat jest w trybie edycji.
- **Typy:** `AICandidateViewModel[]`.
- **Propsy:**
  - `candidates: AICandidateViewModel[]`: Tablica kandydatów do wyświetlenia.
  - `onAccept: (candidateId: string) => void`: Callback akceptacji.
  - `onReject: (candidateId: string) => void`: Callback odrzucenia.
  - `onEditToggle: (candidateId: string, isEditing: boolean) => void`: Callback przełączania edycji.
  - `onEditChange: (candidateId: string, field: 'front' | 'back', value: string) => void`: Callback zmiany wartości w edycji.
  - `onSaveEdit: (candidateId: string) => void`: Callback zapisu edycji.
  - `onAcceptAll: () => void`: Callback akceptacji wszystkich.
  - `isBulkLoading: boolean`: Wskazuje, czy trwa akcja "Akceptuj Wszystkie".

### `AICandidateListItem.tsx` (`src/components/AICandidateListItem.tsx`)

- **Opis:** Komponent reprezentujący pojedynczego kandydata na fiszkę na liście. Obsługuje dwa tryby: wyświetlania i edycji.
- **Główne elementy:**
  - **Tryb wyświetlania:** Ikona "@" (np. z `lucide-react`), tekst `front_text` i `back_text`, przyciski "Edytuj", "Akceptuj", "Odrzuć" (Shadcn/ui `Button`).
  - **Tryb edycji:** `Textarea` (Shadcn/ui) dla `editedFront` z licznikiem znaków, `Textarea` (Shadcn/ui) dla `editedBack` z licznikiem znaków, komunikaty błędów walidacji, przyciski "Zapisz zmiany", "Anuluj" (Shadcn/ui `Button`). Wskaźnik ładowania dla akcji (save/accept/reject).
- **Obsługiwane interakcje:** Kliknięcie przycisków "Edytuj", "Akceptuj", "Odrzuć", "Zapisz zmiany", "Anuluj". Wprowadzanie tekstu w polach edycji.
- **Obsługiwana walidacja:**
  - W trybie edycji, przed zapisem:
    - `editedFront.length <= 200`: Sprawdzenie maksymalnej długości przodu.
    - `editedBack.length <= 500`: Sprawdzenie maksymalnej długości tyłu.
  - Wyświetlanie komunikatów o błędach walidacji przy polach.
- **Typy:** `AICandidateViewModel`, `UpdateAICandidateCommand`.
- **Propsy:**
  - `candidate: AICandidateViewModel`: Dane kandydata i jego stan UI.
  - `onAccept: (candidateId: string) => void`: Callback akceptacji.
  - `onReject: (candidateId: string) => void`: Callback odrzucenia.
  - `onEditToggle: (candidateId: string, isEditing: boolean) => void`: Callback przełączania edycji.
  - `onEditChange: (candidateId: string, field: 'front' | 'back', value: string) => void`: Callback zmiany wartości w edycji.
  - `onSaveEdit: (candidateId: string) => void`: Callback zapisu edycji.

## 5. Typy

Oprócz istniejących typów DTO (`AICandidateDTO`, `GenerateFlashcardCandidatesCommand`, `GenerateAiCandidatesResponseDto`, `UpdateAICandidateCommand`, `ApiErrorResponseDto`), potrzebny będzie nowy typ ViewModel do zarządzania stanem UI dla każdego kandydata:

```typescript
/**
 * AICandidateViewModel rozszerza AICandidateDTO o stan specyficzny dla interfejsu użytkownika.
 */
interface AICandidateViewModel extends AICandidateDTO {
  /** Wskazuje, czy kandydat jest aktualnie w trybie edycji. */
  isEditing: boolean;
  /** Przechowuje tymczasową wartość pola 'przód' podczas edycji. */
  editedFront: string;
  /** Przechowuje tymczasową wartość pola 'tył' podczas edycji. */
  editedBack: string;
  /** Przechowuje błędy walidacji dla pól edycji. */
  validationErrors?: { front?: string; back?: string };
  /** Wskazuje, czy trwa operacja zapisu/akceptacji/odrzucenia dla tego konkretnego elementu. */
  isSaving?: boolean;
}
```

## 6. Zarządzanie stanem

Stan widoku będzie zarządzany w głównym komponencie `DashboardView.tsx` przy użyciu hooków React (`useState`, `useCallback`).

- **Główne stany:**
  - `candidates: AICandidateViewModel[]`: Lista kandydatów wraz z ich stanem UI.
  - `sourceText: string`: Tekst wprowadzony w formularzu generowania (może być zarządzany lokalnie w `AIGenerationForm` lub podniesiony do `DashboardView`).
  - `isLoadingGeneration: boolean`: Stan ładowania dla głównego procesu generowania.
  - `generationError: ApiErrorResponseDto | string | null`: Błąd zwrócony podczas generowania.
  - `isBulkLoading: boolean`: Stan ładowania dla akcji "Akceptuj Wszystkie".

- **Podnoszenie stanu (State Lifting):** Stan `isEditing`, `editedFront`, `editedBack`, `validationErrors`, `isSaving` dla poszczególnych `AICandidateListItem` będzie zarządzany w `DashboardView` w ramach obiektu `AICandidateViewModel` w tablicy `candidates`. Umożliwi to koordynację działań (np. wyłączenie "Akceptuj Wszystkie" podczas edycji) i spójne zarządzanie danymi.

- **Custom Hook (Opcjonalnie):** W miarę rozwoju logiki można rozważyć stworzenie customowego hooka `useAiCandidates` do enkapsulacji zarządzania stanem kandydatów, logiki API i obsługi błędów, aby odciążyć `DashboardView`. Na początek logika może pozostać w `DashboardView`.

## 7. Integracja API

Integracja z API będzie realizowana za pomocą standardowej funkcji `fetch` w `DashboardView.tsx`.

- **Generowanie Kandydatów:**
  - Wywołanie: `POST /api/ai/generate`
  - Request Body: `GenerateFlashcardCandidatesCommand` (`{ sourceText: string }`)
  - Response (Success 201): `GenerateAiCandidatesResponseDto` (`{ data: AICandidateDTO[] }`)
  - Response (Error): `ApiErrorResponseDto`
- **Aktualizacja Kandydata (Zapis Edycji):**
  - Wywołanie: `PUT /api/ai-candidates/{candidateId}`
  - Request Body: `UpdateAICandidateCommand` (`{ front_text: string, back_text: string }`)
  - Response (Success 200): `AICandidateDTO` (zaktualizowany kandydat)
  - Response (Error): `ApiErrorResponseDto`
- **Akceptacja Kandydata:**
  - Wywołanie: `POST /api/ai-candidates/{candidateId}/accept`
  - Request Body: Brak
  - Response (Success 201): `FlashcardDTO` (nowo utworzona fiszka - może nie być potrzebna w stanie Dashboard)
  - Response (Error): `ApiErrorResponseDto`
- **Odrzucenie Kandydata:**
  - Wywołanie: `DELETE /api/ai-candidates/{candidateId}`
  - Request Body: Brak
  - Response (Success 204): Brak treści
  - Response (Error): `ApiErrorResponseDto`
- **Akceptacja Wszystkich:**
  - Wywołanie: Seria wywołań `POST /api/ai-candidates/{candidateId}/accept` dla każdego kandydata (np. używając `Promise.allSettled` do obsługi częściowych błędów).

Należy obsłużyć różne kody statusu odpowiedzi (2xx, 4xx, 5xx) i odpowiednio aktualizować stan UI oraz wyświetlać komunikaty dla użytkownika za pomocą `Toast`.

## 8. Interakcje użytkownika

- **Wpisanie tekstu w polu źródłowym:** Aktualizacja stanu pola tekstowego.
- **Kliknięcie "Generuj":** Ustawienie `isLoadingGeneration = true`, wywołanie API. Po odpowiedzi: aktualizacja listy `candidates` lub wyświetlenie błędu w `Toast`, `isLoadingGeneration = false`.
- **Kliknięcie "Edytuj" na kandydacie:** Aktualizacja stanu `isEditing = true` dla danego kandydata w `candidates`, skopiowanie `front_text`/`back_text` do `editedFront`/`editedBack`.
- **Wpisanie tekstu w polach edycji:** Aktualizacja `editedFront`/`editedBack` i `validationErrors` w stanie kandydata. Wyświetlanie liczników znaków.
- **Kliknięcie "Anuluj" w trybie edycji:** Ustawienie `isEditing = false`, odrzucenie zmian (`editedFront`/`editedBack` nie są zapisywane).
- **Kliknięcie "Zapisz zmiany" w trybie edycji:** Walidacja długości pól. Jeśli poprawna: ustawienie `isSaving = true` dla kandydata, wywołanie `PUT` API. Po odpowiedzi: aktualizacja danych kandydata w `candidates`, ustawienie `isEditing = false`, `isSaving = false`, ewentualnie `Toast`. Jeśli walidacja niepoprawna: wyświetlenie `validationErrors`.
- **Kliknięcie "Akceptuj" na kandydacie:** Ustawienie `isSaving = true` dla kandydata, wywołanie `POST .../accept` API. Po odpowiedzi: usunięcie kandydata z `candidates`, `isSaving = false`, `Toast` sukcesu/błędu.
- **Kliknięcie "Odrzuć" na kandydacie:** Ustawienie `isSaving = true` dla kandydata, wywołanie `DELETE` API. Po odpowiedzi: usunięcie kandydata z `candidates`, `isSaving = false`, `Toast` sukcesu/błędu.
- **Kliknięcie "Akceptuj Wszystkie":** Ustawienie `isBulkLoading = true`, wywołanie serii `POST .../accept` API. Po zakończeniu wszystkich: aktualizacja `candidates`, `isBulkLoading = false`, `Toast` z podsumowaniem.

## 9. Warunki i walidacja

- **Formularz generowania:** Pole tekstowe nie powinno być puste (opcjonalna walidacja klienta).
- **Edycja kandydata (`AICandidateListItem`):**
  - Maksymalna długość `editedFront`: 200 znaków.
  - Maksymalna długość `editedBack`: 500 znaków.
  - Walidacja przeprowadzana po stronie klienta przed próbą zapisu (`handleSaveEdit`).
  - Błędy walidacji (`validationErrors`) są przechowywane w stanie `AICandidateViewModel` i wyświetlane przy odpowiednich polach `Textarea`.
  - Próba zapisu jest blokowana, jeśli walidacja nie przejdzie.
- **Przycisk "Akceptuj Wszystkie":** Powinien być wyłączony (`disabled`), jeśli jakikolwiek kandydat jest w trybie edycji (`isEditing === true`).

## 10. Obsługa błędów

- **Błędy API:** Wszystkie wywołania `fetch` powinny zawierać bloki `try...catch` oraz sprawdzać `response.ok`.
  - W przypadku błędów (status 4xx, 5xx lub błąd sieci), należy odczytać treść odpowiedzi (jeśli dostępna, próbując sparsować jako `ApiErrorResponseDto`) i wyświetlić zrozumiały komunikat dla użytkownika za pomocą `Toast` (np. `toast.error(...)`).
  - Należy obsłużyć specyficzne kody błędów, jeśli wymagają innego zachowania (np. 401 Unauthorized może wymagać przekierowania do logowania, 429 Too Many Requests - informacja o limicie).
  - Stany ładowania (`isLoadingGeneration`, `isSaving`, `isBulkLoading`) muszą być resetowane (`false`) również w przypadku błędu.
- **Błędy walidacji (edycja):** Obsługiwane lokalnie w `AICandidateListItem` przez wyświetlanie komunikatów przy polach i blokowanie zapisu.
- **Brak kandydatów:** Jeśli API generowania zwróci pustą tablicę, `AICandidateList` powinien wyświetlić odpowiedni komunikat (np. "Nie wygenerowano żadnych fiszek. Spróbuj ponownie z innym tekstem.").
- **Częściowe błędy (Akceptuj Wszystkie):** Jeśli część wywołań API w `handleAcceptAll` zakończy się błędem, należy usunąć tylko pomyślnie zaakceptowanych kandydatów i poinformować użytkownika w `Toast` o częściowym sukcesie.

## 11. Kroki implementacji

1. **Utworzenie plików komponentów:** Stwórz puste pliki `.tsx` dla `DashboardView`, `AIGenerationForm`, `AICandidateList`, `AICandidateListItem` w `src/components/`.
2. **Struktura `DashboardPage.astro`:** Zaktualizuj `src/pages/index.astro`, aby renderował `<DashboardView client:load />` wewnątrz `<Layout>`.
3. **Implementacja `AIGenerationForm`:** Zbuduj formularz z `Textarea` i `Button` (Shadcn/ui). Dodaj zarządzanie stanem dla `sourceText` i przekaż `onSubmit` oraz `isLoading` jako propsy.
4. **Implementacja `DashboardView` (szkielet):** Zdefiniuj stany (`candidates`, `isLoadingGeneration`, etc.). Zaimplementuj podstawowe renderowanie `<AIGenerationForm>` i `<AICandidateList>`.
5. **Implementacja `AICandidateListItem` (tryb wyświetlania):** Zbuduj widok kandydata z ikoną "@", tekstami `front_text`, `back_text` oraz przyciskami "Edytuj", "Akceptuj", "Odrzuć". Podłącz propsy `onEditToggle`, `onAccept`, `onReject`.
6. **Implementacja `AICandidateList`:** Zbuduj komponent renderujący listę `AICandidateListItem` na podstawie propsa `candidates`. Dodaj przycisk "Akceptuj Wszystkie" i podłącz prop `onAcceptAll`. Dodaj logikę wyłączania przycisku "Akceptuj Wszystkie".
7. **Implementacja logiki generowania w `DashboardView`:** Zaimplementuj `handleGenerate`, wywołanie `POST /api/ai/generate`, obsługę odpowiedzi (sukces/błąd), aktualizację stanu `candidates` i `isLoadingGeneration`, użycie `Toast`.
8. **Implementacja logiki akceptacji/odrzucenia w `DashboardView`:** Zaimplementuj `handleAccept` i `handleReject`, wywołania API (`POST .../accept`, `DELETE`), obsługę odpowiedzi, aktualizację `candidates`, użycie `Toast`. Dodaj stan `isSaving` do `AICandidateViewModel`.
9. **Implementacja `AICandidateListItem` (tryb edycji):** Dodaj logikę przełączania do trybu edycji (`isEditing`). Zaimplementuj renderowanie pól `Textarea` z licznikami znaków, przycisków "Zapisz zmiany", "Anuluj". Podłącz `editedFront`, `editedBack`, `validationErrors` ze stanu.
10. **Implementacja logiki edycji w `DashboardView`:** Zaimplementuj `handleEditToggle`, `handleEditChange`, `handleSaveEdit`. Dodaj walidację po stronie klienta w `handleSaveEdit` przed wywołaniem `PUT` API. Obsłuż odpowiedź API, aktualizuj `candidates`, użyj `Toast`.
11. **Implementacja logiki "Akceptuj Wszystkie" w `DashboardView`:** Zaimplementuj `handleAcceptAll`, wywołanie serii API (`Promise.allSettled`), obsługę wyników (częściowe błędy), aktualizację `candidates`, stan `isBulkLoading`, użycie `Toast`.
12. **Stylowanie i Dostępność:** Dopracuj wygląd za pomocą Tailwind/Shadcn. Upewnij się, że wszystkie interaktywne elementy są dostępne z klawiatury, posiadają odpowiednie etykiety i atrybuty ARIA.
13. **Testowanie:** Przetestuj wszystkie przepływy użytkownika, obsługę błędów i przypadki brzegowe.
