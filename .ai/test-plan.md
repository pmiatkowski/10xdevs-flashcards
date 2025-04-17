# Plan Testów dla Projektu AI Flashcards

## 1. Wprowadzenie i Cele Testowania

### 1.1. Wprowadzenie

Niniejszy dokument opisuje plan testów dla aplikacji webowej AI Flashcards. Aplikacja umożliwia użytkownikom generowanie fiszek edukacyjnych za pomocą AI na podstawie wklejonego tekstu, tworzenie ich manualnie, zarządzanie nimi oraz przeprowadzanie sesji powtórek opartych na algorytmie Spaced Repetition. Plan obejmuje strategię, zakres, zasoby i harmonogram działań testowych mających na celu zapewnienie jakości, funkcjonalności, wydajności i bezpieczeństwa aplikacji.

### 1.2. Cele Testowania

Główne cele procesu testowania to:

* Weryfikacja zgodności aplikacji z wymaganiami funkcjonalnymi i niefunkcjonalnymi opisanymi w dokumentacji projektu (np. PRD).
* Identyfikacja i raportowanie defektów oprogramowania.
* Ocena jakości i stabilności aplikacji przed wdrożeniem.
* Zapewnienie pozytywnego doświadczenia użytkownika (UX).
* Weryfikacja bezpieczeństwa danych użytkownika i integralności systemu.
* Ocena wydajności kluczowych operacji (np. generowanie AI, pobieranie danych).
* Sprawdzenie poprawności integracji z usługami zewnętrznymi (Supabase, OpenRouter).
* Zapewnienie dostępności aplikacji (Accessibility).

## 2. Zakres Testów

### 2.1. Funkcjonalności objęte testami

* **Zarządzanie Kontem Użytkownika:** Rejestracja, logowanie, wylogowanie, resetowanie hasła, usuwanie konta.
* **Generowanie Fiszki przez AI:** Wklejanie tekstu, inicjowanie generowania, obsługa procesu generowania, wyświetlanie kandydatów.
* **Zarządzanie Kandydatami AI:** Wyświetlanie listy kandydatów, edycja, akceptacja, odrzucenie pojedynczego kandydata, akceptacja/odrzucenie wszystkich.
* **Manualne Tworzenie Fiszki:** Wyświetlanie formularza, wprowadzanie danych (front/back), walidacja limitów znaków, zapisywanie fiszki.
* **Zarządzanie Zapisanymi Fiszkami:** Wyświetlanie listy fiszek, paginacja, sortowanie, edycja inline, usuwanie fiszki.
* **Sesja Powtórek (Spaced Repetition):** Rozpoczynanie sesji, wyświetlanie fiszek, odkrywanie odpowiedzi, ocenianie odpowiedzi, zakończenie sesji, zarządzanie stanem SR (obecnie localStorage).
* **Ustawienia:** Zmiana motywu (jasny/ciemny).
* **Nawigacja i Routing:** Poprawność działania linków i przejść między stronami (View Transitions).
* **Obsługa Błędów:** Wyświetlanie komunikatów o błędach (walidacja, API, sieć).
* **Responsywność (RWD):** Poprawne wyświetlanie i działanie na różnych rozmiarach ekranu.
* **Dostępność (Accessibility):** Zgodność z podstawowymi wytycznymi WCAG (np. obsługa klawiatury, atrybuty ARIA).

### 2.2. Funkcjonalności wyłączone z testów (MVP)

Zgodnie z dokumentacją projektu, następujące obszary są poza zakresem testów dla wersji MVP:

* Zaawansowane algorytmy Spaced Repetition (inne niż zintegrowany).
* Import fiszek z plików.
* Funkcje społecznościowe.
* Integracje z zewnętrznymi platformami edukacyjnymi.
* Aplikacje mobilne.
* Zaawansowane formatowanie tekstu w fiszkach.
* Tagowanie/kategoryzacja fiszek.
* Zaawansowane logowanie błędów po stronie serwera.
* Konfigurowalne ustawienia interfejsu użytkownika (poza motywem).

## 3. Typy Testów do Przeprowadzenia

* **Testy Jednostkowe (Unit Tests):**
  * Cel: Weryfikacja poprawności działania izolowanych fragmentów kodu (funkcje, komponenty React, hooki, serwisy, utils).
  * Narzędzia: Vitest, React Testing Library.
  * Zakres: Logika biznesowa w serwisach (`openRouterService`, `flashcardsService`, `srService`), logika w hookach (`useFlashcards`, `useReviewSession`), funkcje pomocnicze, walidacja Zod.
* **Testy Integracyjne (Integration Tests):**
  * Cel: Weryfikacja współpracy między różnymi modułami systemu.
  * Narzędzia: Vitest, React Testing Library, Supertest (dla API), Mock Service Worker (MSW) lub mockowanie klienta Supabase/OpenRouter.
  * Zakres: Interakcja komponentów React, współpraca frontend-backend (wywołania API), integracja z Supabase (mockowana lub testowa instancja), integracja z OpenRouter (mockowana), działanie middleware Astro.
* **Testy End-to-End (E2E Tests):**
  * Cel: Symulacja rzeczywistych scenariuszy użytkownika w przeglądarce.
  * Narzędzia: Playwright.
  * Zakres: Kluczowe przepływy użytkownika (rejestracja -> logowanie -> generowanie AI -> akceptacja -> przeglądanie fiszek -> sesja powtórek -> wylogowanie), manualne tworzenie fiszki, edycja, usuwanie.
* **Testy Akceptacyjne Użytkownika (UAT):**
  * Cel: Potwierdzenie przez interesariuszy (np. Product Owner), że aplikacja spełnia wymagania biznesowe.
  * Metoda: Testy manualne oparte na User Stories i kryteriach akceptacji.
* **Testy Wydajnościowe (Performance Tests):**
  * Cel: Ocena szybkości odpowiedzi i stabilności aplikacji pod obciążeniem.
  * Narzędzia: k6, Apache JMeter (dla API), Lighthouse (dla frontendu).
  * Zakres: Testy obciążeniowe dla kluczowych endpointów API (`/api/ai/generate`, `/api/flashcards`), pomiar czasu ładowania stron frontendowych.
* **Testy Bezpieczeństwa (Security Tests):**
  * Cel: Identyfikacja potencjalnych luk bezpieczeństwa.
  * Metoda: Przegląd kodu pod kątem bezpieczeństwa, testy penetracyjne (manualne lub automatyczne), weryfikacja konfiguracji Supabase RLS i middleware.
  * Zakres: Autoryzacja, zarządzanie sesją, ochrona przed atakami typu XSS, CSRF, SQL Injection (w kontekście Supabase), bezpieczeństwo API (np. rate limiting).
* **Testy Wizualne (Visual Regression Tests):**
  * Cel: Wykrywanie niezamierzonych zmian w interfejsie użytkownika.
  * Narzędzia: Playwright z integracją np. Percy.io lub Applitools, Storybook (jeśli używany).
  * Zakres: Kluczowe widoki i komponenty na różnych rozdzielczościach i w różnych trybach (jasny/ciemny).
* **Testy Dostępności (Accessibility Tests):**
  * Cel: Zapewnienie zgodności z wytycznymi WCAG.
  * Narzędzia: Axe DevTools, Lighthouse, manualne testy z czytnikami ekranu (NVDA, VoiceOver).
  * Zakres: Nawigacja klawiaturą, kontrast kolorów, atrybuty ARIA, semantyka HTML.
* **Testy Kompatybilności (Compatibility Tests):**
  * Cel: Sprawdzenie działania aplikacji na różnych przeglądarkach i systemach operacyjnych.
  * Metoda: Testy manualne lub automatyczne E2E na różnych środowiskach (np. BrowserStack, Sauce Labs).
  * Zakres: Najpopularniejsze przeglądarki (Chrome, Firefox, Safari, Edge) w aktualnych wersjach.

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

*(Przykładowe scenariusze - pełna lista powinna być rozwijana w osobnym dokumencie Test Cases)*

**4.1. Generowanie Fiszki przez AI**

* **TC-AI-001:** Pomyślne wygenerowanie kandydatów dla poprawnego tekstu źródłowego (powyżej 100 znaków).
* **TC-AI-002:** Wyświetlenie błędu walidacji dla tekstu źródłowego poniżej 100 znaków.
* **TC-AI-003:** Wyświetlenie błędu walidacji dla tekstu źródłowego powyżej limitu (np. 10000 znaków).
* **TC-AI-004:** Obsługa błędu API OpenRouter podczas generowania.
* **TC-AI-005:** Wyświetlenie stanu ładowania podczas generowania.
* **TC-AI-006:** Poprawne wyświetlenie wygenerowanych kandydatów na liście.

**4.2. Zarządzanie Kandydatami AI**

* **TC-CAN-001:** Pomyślna akceptacja pojedynczego kandydata (zapis do `flashcards`, usunięcie z `ai_candidates`).
* **TC-CAN-002:** Pomyślne odrzucenie pojedynczego kandydata (usunięcie z `ai_candidates`).
* **TC-CAN-003:** Edycja kandydata (zmiana front/back) i pomyślna akceptacja.
* **TC-CAN-004:** Próba akceptacji edytowanego kandydata z przekroczonym limitem znaków (wyświetlenie błędu).
* **TC-CAN-005:** Pomyślna akceptacja wszystkich kandydatów.
* **TC-CAN-006:** Pomyślne odrzucenie wszystkich kandydatów.
* **TC-CAN-007:** Obsługa błędów API podczas akceptacji/odrzucenia.

**4.3. Zarządzanie Zapisanymi Fiszkami**

* **TC-FL-001:** Pomyślne wyświetlenie listy zapisanych fiszek (z paginacją i sortowaniem domyślnym).
* **TC-FL-002:** Pomyślne manualne utworzenie nowej fiszki.
* **TC-FL-003:** Próba utworzenia fiszki z pustym polem front/back (błąd walidacji).
* **TC-FL-004:** Próba utworzenia fiszki z przekroczonym limitem znaków (błąd walidacji).
* **TC-FL-005:** Pomyślna edycja istniejącej fiszki (tryb inline).
* **TC-FL-006:** Próba zapisu edytowanej fiszki z przekroczonym limitem znaków (błąd walidacji).
* **TC-FL-007:** Pomyślne usunięcie istniejącej fiszki.
* **TC-FL-008:** Poprawna zmiana sortowania listy fiszek.
* **TC-FL-009:** Poprawna nawigacja między stronami listy fiszek.
* **TC-FL-010:** Obsługa błędów API podczas operacji CRUD.

**4.4. Uwierzytelnianie**

* **TC-AUTH-001:** Pomyślna rejestracja nowego użytkownika.
* **TC-AUTH-002:** Próba rejestracji z istniejącym adresem e-mail.
* **TC-AUTH-003:** Próba rejestracji z niepoprawnym formatem e-mail.
* **TC-AUTH-004:** Próba rejestracji ze zbyt krótkim hasłem.
* **TC-AUTH-005:** Pomyślne logowanie istniejącego użytkownika.
* **TC-AUTH-006:** Próba logowania z błędnym hasłem/e-mailem.
* **TC-AUTH-007:** Pomyślne wylogowanie.
* **TC-AUTH-008:** Pomyślne zresetowanie hasła.
* **TC-AUTH-009:** Pomyślne usunięcie konta użytkownika (z potwierdzeniem).
* **TC-AUTH-010:** Ochrona tras wymagających zalogowania (przekierowanie na stronę logowania).

**4.5. Sesja Powtórek**

* **TC-SR-001:** Pomyślne rozpoczęcie sesji powtórek (załadowanie fiszek do powtórki).
* **TC-SR-002:** Poprawne wyświetlanie przodu fiszki.
* **TC-SR-003:** Poprawne odkrywanie tyłu fiszki.
* **TC-SR-004:** Poprawne działanie przycisków oceny (np. "Łatwe", "Trudne").
* **TC-SR-005:** Poprawne przechodzenie do następnej fiszki.
* **TC-SR-006:** Poprawne zakończenie sesji po przejrzeniu wszystkich fiszek.
* **TC-SR-007:** Weryfikacja zapisywania stanu SR w localStorage (lub przyszłym mechanizmie backendowym).
* **TC-SR-008:** Obsługa pustej kolejki powtórek.

## 5. Środowisko Testowe

* **Środowisko Deweloperskie (Local):** Używane przez deweloperów do uruchamiania testów jednostkowych i integracyjnych podczas rozwoju.
* **Środowisko Testowe (Staging):** Oddzielna instancja aplikacji z własną bazą danych Supabase (kopia produkcyjnej lub dedykowana testowa), zintegrowana z CI/CD. Używana do testów integracyjnych, E2E, UAT, wydajnościowych i bezpieczeństwa. Konfiguracja OpenRouter może używać klucza testowego lub być mockowana.
* **Środowisko Produkcyjne (Production):** Ograniczone testy dymne (smoke tests) po wdrożeniu w celu weryfikacji kluczowych funkcjonalności.

## 6. Narzędzia do Testowania

* **Framework do testów jednostkowych/integracyjnych:** Vitest
* **Biblioteka do testowania komponentów React:** React Testing Library
* **Framework do testów E2E:** Playwright
* **Narzędzia do mockowania API:** Mock Service Worker (MSW), Vitest Mocks
* **Narzędzia do testów wydajnościowych:** k6, Lighthouse
* **Narzędzia do testów bezpieczeństwa:** OWASP ZAP, Burp Suite (dla testów manualnych), Snyk (skanowanie zależności)
* **Narzędzia do testów wizualnych:** Playwright + Percy.io/Applitools
* **Narzędzia do testów dostępności:** Axe DevTools, Lighthouse, czytniki ekranu (NVDA, VoiceOver)
* **Narzędzia do testów kompatybilności:** BrowserStack / Sauce Labs (opcjonalnie)
* **System Zarządzania Testami (TMS):** TestRail, Zephyr Scale (Jira plugin), lub prostsze rozwiązania jak arkusze kalkulacyjne (w zależności od skali projektu).
* **System Śledzenia Błędów:** Jira, GitHub Issues.
* **System CI/CD:** GitHub Actions (do automatycznego uruchamiania testów).

## 7. Harmonogram Testów

*(Harmonogram jest przykładowy i powinien być dostosowany do rzeczywistego cyklu rozwoju)*

* **Sprint 1-N (Faza Rozwoju):**
  * Ciągłe pisanie i uruchamianie testów jednostkowych i integracyjnych przez deweloperów.
  * Przygotowanie scenariuszy testowych E2E i manualnych przez QA.
  * Konfiguracja środowiska testowego.
* **Koniec Sprintu N / Faza Stabilizacji:**
  * Wykonanie pełnego cyklu testów regresji (automatycznych E2E i manualnych) na środowisku testowym.
  * Testy eksploracyjne.
  * Testy wydajnościowe i bezpieczeństwa (wstępne).
  * Testy dostępności i wizualne.
* **Faza UAT:**
  * Wykonanie testów akceptacyjnych przez interesariuszy na środowisku testowym.
* **Przed Wdrożeniem:**
  * Ostateczna regresja krytycznych ścieżek.
  * Weryfikacja poprawionych błędów.
* **Po Wdrożeniu (Produkcja):**
  * Testy dymne (smoke tests).
  * Monitorowanie aplikacji.

## 8. Kryteria Akceptacji Testów

### 8.1. Kryteria Wejścia (Rozpoczęcia Testów)

* Dostępna stabilna wersja aplikacji na środowisku testowym.
* Ukończone i zrecenzowane testy jednostkowe i integracyjne dla testowanych funkcjonalności.
* Dostępna dokumentacja wymagań i User Stories.
* Przygotowane scenariusze testowe.
* Skonfigurowane środowisko testowe i narzędzia.

### 8.2. Kryteria Wyjścia (Zakończenia Testów)

* Wykonano wszystkie zaplanowane scenariusze testowe (manualne i automatyczne).
* Osiągnięto zdefiniowany poziom pokrycia kodu testami (np. 80% dla testów jednostkowych/integracyjnych).
* Wszystkie krytyczne (Critical/Blocker) i wysokie (High) błędy zostały naprawione i zweryfikowane.
* Liczba pozostałych błędów o niższym priorytecie (Medium/Low) jest akceptowalna przez interesariuszy.
* Wyniki testów wydajnościowych, bezpieczeństwa i dostępności spełniają zdefiniowane progi akceptacji.
* Pomyślnie zakończono testy UAT.
* Podpisano raport końcowy z testów.

## 9. Role i Odpowiedzialności w Procesie Testowania

* **Inżynier QA / Tester:**
  * Tworzenie i utrzymanie planu testów i scenariuszy testowych.
  * Konfiguracja i utrzymanie środowiska testowego oraz narzędzi.
  * Wykonywanie testów manualnych i automatycznych (E2E, wydajnościowe, bezpieczeństwa, wizualne, dostępności).
  * Raportowanie i weryfikacja błędów.
  * Przygotowywanie raportów z postępu testów.
  * Współpraca z deweloperami i Product Ownerem.
* **Deweloperzy:**
  * Pisanie i utrzymanie testów jednostkowych i integracyjnych.
  * Naprawianie zgłoszonych błędów.
  * Uczestnictwo w przeglądach kodu pod kątem testowalności i jakości.
  * Wsparcie w konfiguracji środowisk.
* **Product Owner / Interesariusze:**
  * Dostarczanie wymagań i kryteriów akceptacji.
  * Uczestnictwo w testach UAT.
  * Podejmowanie decyzji dotyczących priorytetów błędów i akceptacji wyników testów.
* **DevOps / Administrator:**
  * Zarządzanie infrastrukturą (środowiska testowe, produkcyjne).
  * Konfiguracja i utrzymanie CI/CD.
  * Monitorowanie aplikacji.

## 10. Procedury Raportowania Błędów (w późniejszych etapach)

* **Narzędzie:** Jira / GitHub Issues.
* **Cykl życia błędu:** New -> Open -> In Progress -> Ready for QA -> Verified -> Closed / Reopened.
* **Szablon zgłoszenia błędu:**
  * **Tytuł:** Krótki, zwięzły opis problemu.
  * **Projekt:** AI Flashcards.
  * **Komponent:** Obszar aplikacji, którego dotyczy błąd (np. AI Generation, Flashcard List, Authentication).
  * **Środowisko:** Gdzie zaobserwowano błąd (np. Staging, Production, Local).
  * **Wersja:** Wersja aplikacji/build.
  * **Przeglądarka/OS:** Jeśli dotyczy.
  * **Priorytet:** (np. Blocker, Critical, High, Medium, Low) - określa pilność naprawy.
  * **Ważność/Severity:** (np. Critical, Major, Minor, Trivial) - określa wpływ błędu na system.
  * **Kroki do reprodukcji:** Szczegółowa lista kroków pozwalająca odtworzyć błąd.
  * **Wynik aktualny:** Co się dzieje.
  * **Wynik oczekiwany:** Co powinno się dziać.
  * **Załączniki:** Zrzuty ekranu, nagrania wideo, logi konsoli/sieci.
  * **Osoba zgłaszająca:** Kto znalazł błąd.
  * **Przypisany do:** Deweloper odpowiedzialny za naprawę.
* **Weryfikacja błędów:** Tester weryfikuje poprawkę na środowisku testowym. Jeśli błąd został naprawiony, status zmieniany jest na "Verified" lub "Closed". Jeśli nie, status wraca na "Reopened" z komentarzem.
