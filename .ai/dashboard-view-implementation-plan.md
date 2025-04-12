# Plan implementacji widoku Panelu Głównego (Dashboard)

## 1. Przegląd

Widok Panelu Głównego (Dashboard) jest głównym interfejsem dla zalogowanych użytkowników, dostępnym pod ścieżką `/`. Jego podstawowym celem jest umożliwienie użytkownikom szybkiego generowania kandydatów na fiszki przy użyciu AI poprzez wklejenie tekstu źródłowego do dedykowanego formularza. Widok ten inicjuje proces generowania i obsługuje informację zwrotną (sukces lub błąd), nawigując użytkownika do widoku recenzji kandydatów w przypadku powodzenia.

## 2. Routing widoku

* **Ścieżka:** `/`
* **Dostępność:** Tylko dla zalogowanych użytkowników (obsługiwane przez middleware).
* **Plik:** `src/pages/index.astro` (zakładając, że jest to strona główna po zalogowaniu).

## 3. Struktura komponentów

```
Layout.astro
└── index.astro (DashboardPage)
    └── src/components/AIGenerationForm.tsx (client:load)
        ├── label (dla Textarea)
        ├── Textarea (Shadcn/ui)
        ├── Button (Shadcn/ui - "Generuj Fiszki")
        └── (Warunkowy wskaźnik ładowania, np. spinner w przycisku)

(Globalnie w Layout.astro: ToastProvider z Shadcn/ui)
```

## 4. Szczegóły komponentów

### `src/pages/index.astro` (DashboardPage)

* **Opis komponentu:** Strona Astro renderująca główny layout i osadzająca interaktywny komponent formularza AI (`AIGenerationForm`). Odpowiada za strukturę strony. Logika autoryzacji (przekierowanie niezalogowanych) powinna być obsługiwana przez middleware (`src/middleware/index.ts`).
* **Główne elementy:** Wykorzystuje `Layout.astro`. Renderuje komponent `<AIGenerationForm client:load />`.
* **Obsługiwane interakcje:** Brak bezpośrednich interakcji użytkownika na poziomie tej strony.
* **Obsługiwana walidacja:** Brak.
* **Typy:** Brak specyficznych.
* **Propsy:** Brak.

### `src/components/AIGenerationForm.tsx` (Nowy komponent)

* **Opis komponentu:** Komponent React odpowiedzialny za interfejs generowania fiszek AI. Zawiera pole tekstowe na tekst źródłowy oraz przycisk do rozpoczęcia generowania. Zarządza stanem formularza (wprowadzany tekst, stan ładowania, błędy) i obsługuje wywołanie API generowania. Wyświetla informację zwrotną za pomocą toastów.
* **Główne elementy:**
  * `form` element HTML.
  * `label` dla pola tekstowego.
  * Komponent `Textarea` z `shadcn/ui` do wprowadzania tekstu źródłowego.
  * Komponent `Button` z `shadcn/ui` z etykietą "Generuj Fiszki" do wysłania formularza. Przycisk powinien wskazywać stan ładowania (np. przez zmianę tekstu/dodanie spinnera) i być wyłączony podczas ładowania.
* **Obsługiwane interakcje:**
  * Wprowadzanie tekstu w `Textarea`.
  * Kliknięcie przycisku "Generuj Fiszki".
* **Obsługiwana walidacja:**
  * **Klient:** Podstawowa walidacja sprawdzająca, czy pole `Textarea` nie jest puste przed wysłaniem (np. poprzez wyłączenie przycisku lub komunikat przy próbie wysłania).
* **Typy:**
  * Do wywołania API: `GenerateFlashcardCandidatesCommand` (Request), `GenerateAiCandidatesResponseDto` (Success Response), `ApiErrorResponseDto` (Error Response).
  * Do stanu wewnętrznego: `string` (dla `sourceText`), `boolean` (dla `isLoading`), `string | null` (dla `error`).
* **Propsy:** Brak (komponent zarządza własnym stanem).

## 5. Typy

Wymagane typy są już zdefiniowane w `src/types.ts`:

* **`GenerateFlashcardCandidatesCommand`**:
  * `sourceText: string` - Tekst źródłowy do wysłania w ciele żądania POST.
* **`GenerateAiCandidatesResponseDto`**:
  * `data: AICandidateDTO[]` - Struktura odpowiedzi przy sukcesie (201 Created).
* **`AICandidateDTO`**:
  * `id: string`
  * `user_id: string`
  * `front_text: string`
  * `back_text: string`
  * `source_text_hash: string`
  * `created_at: string`
  * `updated_at: string` - Reprezentuje pojedynczego kandydata zwróconego przez API.
* **`ApiErrorResponseDto`**:
  * `message: string`
  * `errors?: Record<string, string[] | undefined> | string` - Struktura odpowiedzi przy błędach API (4xx, 5xx).
* **Typy stanu wewnętrznego (w `AIGenerationForm.tsx`)**:
  * `sourceText: string`
  * `isLoading: boolean`
  * `error: string | null` (opcjonalnie, jeśli błąd ma być wyświetlany inaczej niż tylko toast)

## 6. Zarządzanie stanem

* Stan będzie zarządzany lokalnie w komponencie `AIGenerationForm.tsx` przy użyciu hooków React `useState`.
  * `const [sourceText, setSourceText] = useState<string>('');` - Przechowuje aktualną wartość pola `Textarea`.
  * `const [isLoading, setIsLoading] = useState<boolean>(false);` - Śledzi stan ładowania podczas wywołania API.
  * `const [error, setError] = useState<string | null>(null);` - Przechowuje komunikat błędu (opcjonalnie, głównie będziemy używać toastów).
* Hook `useToast` z `shadcn/ui` będzie używany do wyświetlania powiadomień o sukcesie lub błędzie. Wymaga to globalnego `ToastProvider` (np. w `Layout.astro`).
* Nie ma potrzeby stosowania zewnętrznej biblioteki do zarządzania stanem ani niestandardowych hooków dla tego widoku.

## 7. Integracja API

* **Endpoint:** `POST /api/ai/generate`
* **Akcja:** Wywoływana po kliknięciu przycisku "Generuj Fiszki" w `AIGenerationForm.tsx`.
* **Implementacja:** Użycie standardowego `fetch` API wewnątrz asynchronicznej funkcji obsługi zdarzenia `onSubmit` formularza.

    ```typescript
    // Przykład w AIGenerationForm.tsx
    import { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Textarea } from '@/components/ui/textarea';
    import { useToast } from '@/components/ui/use-toast'; // Załóżmy, że hook jest dostępny
    import type { GenerateFlashcardCandidatesCommand, GenerateAiCandidatesResponseDto, ApiErrorResponseDto } from '@/types';

    // ... wewnątrz komponentu
    const { toast } = useToast();
    const [sourceText, setSourceText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!sourceText.trim()) {
        toast({
          title: "Błąd",
          description: "Pole tekstowe nie może być puste.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      try {
        const command: GenerateFlashcardCandidatesCommand = { sourceText };
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(command),
        });

        if (response.status === 201) {
          const result: GenerateAiCandidatesResponseDto = await response.json();
          toast({
            title: "Sukces!",
            description: `Wygenerowano ${result.data.length} kandydatów na fiszki.`,
          });
          // Nawigacja do strony recenzji kandydatów
          window.location.href = '/ai-candidates'; // Lub użycie navigate() z View Transitions
        } else {
          let errorMessage = `Błąd ${response.status}. Spróbuj ponownie.`;
          try {
            const errorData: ApiErrorResponseDto = await response.json();
            errorMessage = errorData.message || errorMessage;
            // Obsługa specyficznych kodów błędów
            if (response.status === 402) errorMessage = "Wymagana płatność lub kredyty dla usługi AI.";
            if (response.status === 429) errorMessage = "Przekroczono limit żądań. Spróbuj ponownie później.";
          } catch (e) { /* Ignoruj błąd parsowania JSON błędu */ }

          toast({
            title: "Błąd generowania",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Network or fetch error:", error);
        toast({
          title: "Błąd sieci",
          description: "Nie można połączyć się z serwerem. Sprawdź połączenie.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    ```

* **Typy żądania:** `GenerateFlashcardCandidatesCommand` (`{ sourceText: string }`).
* **Typy odpowiedzi:** `GenerateAiCandidatesResponseDto` (sukces), `ApiErrorResponseDto` (błąd).

## 8. Interakcje użytkownika

1. **Wprowadzanie tekstu:** Użytkownik wpisuje lub wkleja tekst do komponentu `Textarea`. Stan `sourceText` jest aktualizowany. Przycisk "Generuj Fiszki" jest aktywny tylko jeśli `sourceText` nie jest pusty.
2. **Kliknięcie "Generuj Fiszki":**
    * Sprawdzana jest walidacja (czy `sourceText` nie jest pusty).
    * Jeśli walidacja przejdzie:
        * Stan `isLoading` ustawiany jest na `true`.
        * Przycisk jest wyłączany i/lub pokazuje wskaźnik ładowania.
        * Wysyłane jest żądanie `POST /api/ai/generate`.
        * **Po sukcesie (201):**
            * `isLoading` ustawiane na `false`.
            * Wyświetlany jest toast sukcesu.
            * Użytkownik jest przekierowywany na stronę `/ai-candidates` (lub inną skonfigurowaną stronę recenzji).
        * **Po błędzie (inny status):**
            * `isLoading` ustawiane na `false`.
            * Wyświetlany jest toast błędu z odpowiednim komunikatem.
            * Użytkownik pozostaje na stronie Dashboard.

## 9. Warunki i walidacja

* **Warunek:** Pole tekstowe (`sourceText`) nie może być puste przed wysłaniem żądania do API.
* **Miejsce walidacji:** W komponencie `AIGenerationForm.tsx`, w funkcji `handleSubmit`.
* **Wpływ na interfejs:** Przycisk "Generuj Fiszki" powinien być nieaktywny (`disabled`), gdy pole tekstowe jest puste. Walidacja musi nastąpić po kliknięciu, wyświetlając toast błędu bez wysyłania żądania API.

## 10. Obsługa błędów

* **Puste pole tekstowe:** Walidacja po stronie klienta w `handleSubmit` zapobiega wysłaniu żądania. Wyświetlany jest toast informujący o konieczności wypełnienia pola.
* **Błędy sieciowe:** Blok `catch` w obsłudze `fetch` przechwytuje błędy połączenia. Wyświetlany jest generyczny toast "Błąd sieci". Szczegóły błędu logowane są do konsoli.
* **Błędy API (status inny niż 201):**
  * Odpowiedź błędu jest parsowana w celu uzyskania `ApiErrorResponseDto`.
  * Wyświetlany jest toast błędu (`variant: "destructive"`).
  * Komunikat toastu jest pobierany z `errorData.message` lub generowany na podstawie kodu statusu (np. dla 401, 402, 429, 500, 502).
  * Szczegóły błędu logowane są do konsoli.

## 11. Kroki implementacji

1. **Utworzenie pliku komponentu:** Stwórz plik `src/components/AIGenerationForm.tsx`.
2. **Implementacja struktury komponentu:** W `AIGenerationForm.tsx` użyj React `useState` do zarządzania stanami `sourceText` i `isLoading`. Zaimplementuj strukturę JSX z elementem `form`, `label`, komponentami `Textarea` i `Button` z `shadcn/ui`.
3. **Implementacja logiki formularza:** Dodaj obsługę zdarzenia `onChange` dla `Textarea` do aktualizacji stanu `sourceText`. Zaimplementuj funkcję `handleSubmit` dla zdarzenia `onSubmit` formularza.
4. **Walidacja klienta:** W `handleSubmit` dodaj sprawdzenie, czy `sourceText` nie jest pusty. Jeśli jest, wyświetl toast błędu i przerwij funkcję. Powiąż atrybut `disabled` przycisku ze stanem `isLoading` oraz ewentualnie z pustym `sourceText`.
5. **Integracja API:** W `handleSubmit`, zaimplementuj wywołanie `fetch` do `POST /api/ai/generate` z odpowiednim ciałem (`{ sourceText }`) i nagłówkami. Użyj `try...catch` do obsługi błędów sieciowych.
6. **Obsługa odpowiedzi API:** W bloku `try`, sprawdź status odpowiedzi.
    * Dla `response.status === 201`: Sparsuj odpowiedź, wyświetl toast sukcesu, wykonaj nawigację (`window.location.href = '/ai-candidates';`).
    * Dla innych statusów: Spróbuj sparsować `ApiErrorResponseDto`, wyświetl odpowiedni toast błędu.
7. **Obsługa stanu ładowania:** Ustaw `isLoading` na `true` przed wywołaniem `fetch` i na `false` w bloku `finally`. Użyj stanu `isLoading` do wizualnego wskazania ładowania na przycisku.
8. **Integracja z Astro:** W pliku `src/pages/index.astro`, zaimportuj i użyj komponentu `<AIGenerationForm client:load />` w odpowiednim miejscu w strukturze strony.
9. **Konfiguracja Toastów:** Upewnij się, że `ToastProvider` z `shadcn/ui` jest dodany globalnie, np. w `src/layouts/Layout.astro`, aby hook `useToast` działał poprawnie.
10. **Testowanie:** Przetestuj różne scenariusze: puste pole, udane generowanie, błędy API (jeśli możliwe do zasymulowania), błędy sieciowe. Sprawdź działanie stanu ładowania i nawigacji. Sprawdź responsywność i dostępność formularza.
