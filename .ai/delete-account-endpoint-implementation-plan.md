# API Endpoint Implementation Plan: Delete User Account

## 1. Przegląd punktu końcowego

Ten punkt końcowy umożliwia uwierzytelnionemu użytkownikowi usunięcie własnego konta oraz wszystkich powiązanych z nim danych z systemu. Operacja ta jest nieodwracalna i wykorzystuje mechanizm kaskadowego usuwania w bazie danych Supabase. Wymaga potwierdzenia w interfejsie użytkownika przed wywołaniem.

## 2. Szczegóły żądania

- **Metoda HTTP:** `DELETE`
- **Struktura URL:** `/api/users/me`
- **Parametry:**
  - Wymagane: Brak (ID użytkownika jest pobierane z kontekstu sesji)
  - Opcjonalne: Brak
- **Request Body:** Brak

## 3. Wykorzystywane typy

- Brak specyficznych DTO lub modeli Command dla tego punktu końcowego.
- Wykorzystany zostanie `APIContext` z Astro do uzyskania dostępu do `context.locals.supabase` (klient Supabase dla uwierzytelnionego użytkownika) oraz `context.locals.session`.
- Do operacji usunięcia użytkownika wymagany będzie administracyjny klient Supabase (z kluczem roli serwisowej).

## 4. Szczegóły odpowiedzi

- **Sukces:**
  - Kod statusu: `204 No Content`
  - Treść odpowiedzi: Brak
- **Błędy:**
  - Kod statusu: `401 Unauthorized` (jeśli użytkownik nie jest uwierzytelniony)
  - Kod statusu: `500 Internal Server Error` (jeśli wystąpi błąd podczas usuwania użytkownika w Supabase)
  - Treść odpowiedzi dla błędów: Standardowy format `ApiErrorResponseDto` (z `src/types.ts`).

      ```json
      {
        "message": "Komunikat błędu"
      }
      ```

## 5. Przepływ danych

1. Żądanie `DELETE` trafia do punktu końcowego `/api/users/me`.
2. Middleware Astro weryfikuje sesję użytkownika i udostępnia `context.locals.session` oraz `context.locals.supabase`.
3. Handler punktu końcowego sprawdza, czy `context.locals.session` istnieje. Jeśli nie, zwraca `401 Unauthorized`.
4. Handler pobiera `userId` z `context.locals.session.user.id`.
5. Handler wywołuje funkcję serwisową (np. `deleteUserAccount(userId)` w `userService.ts`).
6. Funkcja serwisowa inicjalizuje administracyjnego klienta Supabase (używając klucza roli serwisowej z zmiennych środowiskowych).
7. Funkcja serwisowa wywołuje `supabaseAdmin.auth.admin.deleteUser(userId)`.
8. Jeśli operacja w Supabase się powiedzie:
    - Dane użytkownika w `auth.users` zostaną usunięte.
    - Powiązane dane w tabelach `flashcards`, `ai_candidates`, `generation_stats` zostaną usunięte kaskadowo dzięki zdefiniowanym kluczom obcym (`ON DELETE CASCADE`).
    - Handler zwraca odpowiedź `204 No Content`.
9. Jeśli operacja w Supabase się nie powiedzie:
    - Funkcja serwisowa zgłasza błąd.
    - Handler przechwytuje błąd, loguje go po stronie serwera.
    - Handler zwraca odpowiedź `500 Internal Server Error` z odpowiednim komunikatem.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie:** Kluczowe jest poleganie na middleware Astro do weryfikacji sesji użytkownika. Punkt końcowy musi bezwzględnie sprawdzać istnienie `context.locals.session`.
- **Autoryzacja:** Punkt końcowy autoryzuje użytkownika do usunięcia *tylko* własnego konta, pobierając ID użytkownika bezpośrednio z jego sesji.
- **Klucz Roli Serwisowej Supabase:** Klucz `SUPABASE_SERVICE_ROLE_KEY` jest wysoce wrażliwy i musi być przechowywany bezpiecznie jako zmienna środowiskowa na serwerze. Nie może być nigdy ujawniony po stronie klienta. Dostęp do niego powinien mieć tylko kod backendowy (serwis).
- **CSRF:** Ponieważ jest to operacja modyfikująca stan (`DELETE`), należy upewnić się, że mechanizmy ochrony przed CSRF w Astro są aktywne lub zastosować dodatkowe środki, jeśli są wymagane (np. tokeny anty-CSRF), chociaż standardowe wywołania API z nagłówkami `Authorization` często łagodzą ten problem.
- **Potwierdzenie UI:** Niezbędne jest zaimplementowanie wyraźnego kroku potwierdzenia w interfejsie użytkownika przed wywołaniem tego API, aby zapobiec przypadkowemu usunięciu konta.

## 7. Obsługa błędów

- **Brak uwierzytelnienia:** Middleware lub handler zwraca `401 Unauthorized`.
- **Błąd Supabase Admin API:**
  - Występuje podczas wywołania `supabaseAdmin.auth.admin.deleteUser()`.
  - Przyczyna: Problemy sieciowe, wewnętrzny błąd Supabase, nieprawidłowy `userId` (choć powinien być poprawny, jeśli pochodzi z sesji).
  - Obsługa: Złapanie wyjątku w funkcji serwisowej lub handlerze, zalogowanie szczegółów błędu po stronie serwera (np. `console.error`), zwrócenie `500 Internal Server Error` z ogólnym komunikatem dla klienta.

## 8. Rozważania dotyczące wydajności

- Operacja usuwania użytkownika w Supabase Auth jest zazwyczaj szybka.
- Kaskadowe usuwanie w bazie danych może zająć więcej czasu, jeśli użytkownik ma bardzo dużą liczbę powiązanych rekordów (fiszek, kandydatów AI, statystyk). Jest to jednak operacja wykonywana asynchronicznie w tle przez bazę danych po zainicjowaniu przez `deleteUser`.
- Głównym czynnikiem wpływającym na wydajność będzie czas odpowiedzi od Supabase Admin API.

## 9. Etapy wdrożenia

1. **Utworzenie/Aktualizacja Serwisu:**
    - Utwórz plik `src/lib/services/userService.ts` (jeśli nie istnieje).
    - Dodaj funkcję `deleteUserAccount(userId: string): Promise<{ error: Error | null }>`.
    - Wewnątrz funkcji:
        - Pobierz `SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY` ze zmiennych środowiskowych (`import.meta.env`).
        - Rzuć błąd konfiguracyjny, jeśli zmienne nie są ustawione.
        - Utwórz instancję administracyjnego klienta Supabase: `createClient(url, key)`.
        - Wywołaj `supabaseAdmin.auth.admin.deleteUser(userId)`.
        - Zwróć obiekt `{ error }` z wynikiem operacji.
2. **Utworzenie Pliku Endpointu:**
    - Utwórz plik `src/pages/api/users/me.ts`.
3. **Implementacja Handlera `DELETE`:**
    - W pliku `src/pages/api/users/me.ts` wyeksportuj funkcję `DELETE`.
    - Ustaw `export const prerender = false;`.
    - Wewnątrz funkcji `DELETE(context: APIContext)`:
        - Sprawdź `context.locals.session`. Jeśli brak, zwróć `new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })`.
        - Pobierz `userId = context.locals.session.user.id`.
        - Wywołaj `userService.deleteUserAccount(userId)`.
        - Jeśli wystąpił błąd (`result.error`):
            - Zaloguj błąd serwerowo: `console.error('Failed to delete user:', result.error)`.
            - Zwróć `new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 })`.
        - Jeśli operacja się powiodła:
            - Zwróć `new Response(null, { status: 204 })`.
4. **Konfiguracja Zmiennych Środowiskowych:**
    - Upewnij się, że `SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY` są poprawnie skonfigurowane w środowisku deweloperskim (`.env`) i produkcyjnym.
5. **Testowanie:**
    - Napisz testy integracyjne (jeśli dotyczy) lub przeprowadź testy manualne:
        - Próba usunięcia konta bez zalogowania (oczekiwany `401`).
        - Pomyślne usunięcie konta zalogowanego użytkownika (oczekiwany `204`).
        - Sprawdzenie, czy użytkownik i jego dane zostały usunięte z bazy danych Supabase.
        - (Opcjonalnie) Symulacja błędu Supabase (trudne do bezpośredniego testowania, poleganie na logowaniu błędów).
6. **Dokumentacja:**
    - Zaktualizuj dokumentację API (np. Swagger/OpenAPI, jeśli jest używana), aby odzwierciedlić nowy punkt końcowy.
