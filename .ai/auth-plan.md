# Specyfikacja Architektury: Moduł Autentykacji Użytkowników (Fiszki AI)

## 1. Przegląd

Niniejszy dokument opisuje architekturę i implementację modułu autentykacji użytkowników (rejestracja, logowanie, wylogowywanie, odzyskiwanie hasła) dla aplikacji Fiszki AI. Rozwiązanie opiera się na tech stacku projektu: Astro, React, Supabase Auth, Shadcn/ui, Tailwind CSS, TypeScript i Zod. Celem jest zapewnienie bezpiecznego i spójnego przepływu uwierzytelniania, zintegrowanego z istniejącą strukturą aplikacji i wymaganiami funkcjonalnymi ([prd.md](d:\10xdevs\fiszki\.ai\prd.md)).

## 2. Architektura Interfejsu Użytkownika (Frontend)

### 2.1. Strony (Astro - `src/pages/`)

Wszystkie poniższe strony Astro będą wymagały renderowania po stronie serwera (`export const prerender = false;`) w celu obsługi logiki związanej z sesją użytkownika (np. przekierowania zalogowanych/niezalogowanych).

* **`/login` (`src/pages/login.astro`) - Nowa strona:**
  * Renderuje komponent React `<LoginForm client:load />`.
  * Logika serwerowa (w `getStaticPaths` lub bezpośrednio w komponencie Astro): Jeśli użytkownik jest już zalogowany (sprawdzenie `Astro.locals.session`), przekierowuje na `/`.
* **`/register` (`src/pages/register.astro`) - Nowa strona:**
  * Renderuje komponent React `<RegisterForm client:load />`.
  * Logika serwerowa: Jeśli użytkownik jest już zalogowany, przekierowuje na `/`.
* **`/forgot-password` (`src/pages/forgot-password.astro`) - Nowa strona:**
  * Renderuje komponent React `<ForgotPasswordForm client:load />`.
  * Logika serwerowa: Jeśli użytkownik jest już zalogowany, przekierowuje na `/`.
* **`/reset-password` (`src/pages/reset-password.astro`) - Nowa strona:**
  * Renderuje komponent React `<ResetPasswordForm client:load />`.
  * Logika serwerowa: Odczytuje token resetowania hasła z parametrów URL. Jeśli token jest nieobecny lub nieprawidłowy (można to potencjalnie sprawdzić wstępnie po stronie serwera, choć główna walidacja tokenu nastąpi w API), może wyświetlić błąd lub przekierować. Przekazuje token jako prop do `<ResetPasswordForm />`. Jeśli użytkownik jest już zalogowany, przekierowuje na `/`.
* **`/` (`src/pages/index.astro`) - Modyfikacja:**
  * Musi pobierać stan uwierzytelnienia (`Astro.locals.session`, `Astro.locals.user`) po stronie serwera.
  * Przekazuje `isAuthenticated: boolean` (oraz ewentualnie `userEmail: string | null`) jako prop do komponentu `<DashboardView client:load />`.
* **`/flashcards`, `/review`, `/settings` - Modyfikacja (lub implementacja):**
  * Te strony stają się chronione. Dostęp do nich będzie kontrolowany przez middleware. Wymagają `export const prerender = false;`.

### 2.2. Layout (`src/layouts/Layout.astro`) - Modyfikacja

* Pobiera stan uwierzytelnienia (`Astro.locals.session`, `Astro.locals.user`) po stronie serwera.
* **Belka Górna (Header):**
  * Renderuje nowy komponent React `<HeaderAuthControls client:idle isAuthenticated={...} userEmail={...} />`, przekazując stan autentykacji i email użytkownika.
* **Pasek Boczny (Sidebar):**
  * Renderuje komponent `<SidebarNav />` (zakładając, że istnieje lub zostanie stworzony) **tylko** jeśli użytkownik jest zalogowany (`Astro.locals.session` istnieje).

### 2.3. Komponenty (React - `src/components/`)

Komponenty formularzy zostaną umieszczone w nowym podkatalogu `src/components/auth/`. Komponenty layoutu w `src/components/layout/`.

* **`LoginForm` (`src/components/auth/LoginForm.tsx`) - Nowy:**
  * Formularz z polami "Email" (`Input`), "Hasło" (`Input type="password"`), przyciskiem "Zaloguj się" (`Button`).
  * Wykorzystuje `react-hook-form` (opcjonalnie) i Zod do walidacji po stronie klienta (email format, hasło niepuste).
  * Wyświetla błędy walidacji inline przy polach.
  * Zarządza stanem ładowania (`isLoading`).
  * Po submisji wywołuje endpoint `POST /api/auth/login`.
  * Wyświetla błędy API (np. "Nieprawidłowe dane logowania") za pomocą `useToast` z Shadcn/ui.
  * Po sukcesie przekierowuje na `/` (np. `window.location.href = '/';`).
  * Zawiera link do `/register` i `/forgot-password`.
* **`RegisterForm` (`src/components/auth/RegisterForm.tsx`) - Nowy:**
  * Formularz z polami "Email", "Hasło", "Potwierdź hasło", przyciskiem "Zarejestruj się".
  * Walidacja Zod: email format, hasło min. 4 znaki, hasła muszą się zgadzać.
  * Wyświetla błędy walidacji inline.
  * Zarządza stanem ładowania.
  * Po submisji wywołuje `POST /api/auth/register`.
  * Wyświetla błędy API (np. "Email już istnieje") za pomocą `useToast`.
  * Po sukcesie przekierowuje na `/`.
  * Zawiera link do `/login`.
* **`ForgotPasswordForm` (`src/components/auth/ForgotPasswordForm.tsx`) - Nowy:**
  * Formularz z polem "Email", przyciskiem "Wyślij link do resetowania".
  * Walidacja Zod: email format.
  * Zarządza stanem ładowania.
  * Po submisji wywołuje `POST /api/auth/forgot-password`.
  * Wyświetla **ogólny komunikat sukcesu** (np. "Jeśli konto istnieje, link został wysłany.") za pomocą `useToast`, niezależnie od odpowiedzi API (ze względów bezpieczeństwa). Wyświetla błędy serwera (5xx) lub rate limiting (429).
  * Zawiera link do `/login`.
* **`ResetPasswordForm` (`src/components/auth/ResetPasswordForm.tsx`) - Nowy:**
  * Otrzymuje `resetToken: string` jako prop od strony Astro.
  * Formularz z polami "Nowe hasło", "Potwierdź nowe hasło", przyciskiem "Ustaw nowe hasło".
  * Walidacja Zod: hasło min. 4 znaki, hasła muszą się zgadzać.
  * Wyświetla błędy walidacji inline.
  * Zarządza stanem ładowania.
  * Po submisji wywołuje `POST /api/auth/reset-password`, przesyłając `token` i `newPassword`.
  * Wyświetla błędy API (np. "Link wygasł", "Nieprawidłowy link") za pomocą `useToast`.
  * Po sukcesie wyświetla `Toast` i przekierowuje na `/login`.
* **`HeaderAuthControls` (`src/components/layout/HeaderAuthControls.tsx`) - Nowy:**
  * Otrzymuje `isAuthenticated: boolean` i `userEmail: string | null` jako propsy.
  * Jeśli `isAuthenticated` jest `false`, renderuje linki "Zaloguj się" (`/login`) i "Zarejestruj się" (`/register`).
  * Jeśli `isAuthenticated` jest `true`, renderuje email użytkownika (lub inną formę identyfikacji) oraz przycisk "Wyloguj".
  * Przycisk "Wyloguj" wywołuje endpoint `POST /api/auth/logout` i po sukcesie przekierowuje na `/login` (lub `/`).
* **`DashboardView`, `AICandidateListItem`, `CallToActionLogin` - Modyfikacje:**
  * Potwierdzenie implementacji logiki warunkowego renderowania/blokowania funkcjonalności na podstawie propsa `isAuthenticated` zgodnie z [dashboard-view-implementation-plan.md](d:\10xdevs\fiszki\.ai\dashboard-view-implementation-plan.md). `CallToActionLogin` zawiera linki do `/login` i `/register`.
  * **`DashboardView`:** Dodatkowo implementuje logikę zachowania stanu dla gości (zgodnie z US-014):
    * Po wygenerowaniu kandydatów przez gościa, zapisuje `sourceText` i `candidates` do `sessionStorage`.
    * Przy montowaniu komponentu, jeśli `isAuthenticated` jest `true`, sprawdza `sessionStorage`. Jeśli dane istnieją, ładuje je do stanu komponentu i czyści `sessionStorage`.

### 2.4. Scenariusze i Przepływy

* **Gość na `/`:** Widzi formularz generowania, może generować kandydatów. Widzi `CallToActionLogin`. Widzi linki "Zaloguj się", "Zarejestruj się" w headerze.
* **Gość na `/login`:** Widzi formularz logowania.
* **Gość na `/register`:** Widzi formularz rejestracji.
* **Gość na `/flashcards` (lub innej chronionej):** Jest przekierowywany przez middleware na `/login`.
* **Logowanie (sukces):** Użytkownik jest przekierowywany na `/`. Header pokazuje email/przycisk wylogowania. Sidebar jest widoczny. Funkcje na Dashboardzie są odblokowane. **Jeśli w `sessionStorage` znajdują się dane gościa (`sourceText`, `candidates`), `DashboardView` je załaduje i wyczyści storage.**
* **Rejestracja (sukces):** Użytkownik jest zalogowany i przekierowywany na `/` (jak po logowaniu). **Jeśli w `sessionStorage` znajdują się dane gościa (`sourceText`, `candidates`), `DashboardView` je załaduje i wyczyści storage.**
* **Wylogowanie:** Użytkownik jest przekierowywany na `/login` (lub `/`). Header pokazuje linki logowania/rejestracji. Sidebar znika.
* **Zalogowany użytkownik na `/login` lub `/register`:** Jest przekierowywany przez middleware na `/`.
* **Odzyskiwanie hasła:** Użytkownik przechodzi przez `/forgot-password`, otrzymuje email, klika link prowadzący do `/reset-password?token=...`, ustawia nowe hasło, jest przekierowywany na `/login`.

### 2.5. Zachowanie Stanu Gościa (US-014)

Aby spełnić wymaganie US-014 dotyczące zachowania stanu gościa po zalogowaniu/rejestracji:

1. Gdy niezalogowany użytkownik (`isAuthenticated === false`) pomyślnie wygeneruje kandydatów w komponencie `DashboardView`, komponent ten zapisze aktualny `sourceText` oraz tablicę wygenerowanych `candidates` (w formacie `AICandidateViewModel[]` lub `AICandidateDTO[]`) do `sessionStorage` przeglądarki.
2. Po pomyślnym logowaniu lub rejestracji, użytkownik jest przekierowywany na stronę główną (`/`). Następuje pełne przeładowanie strony.
3. Komponent `DashboardView` jest ponownie montowany, tym razem z propsem `isAuthenticated === true`.
4. W hooku `useEffect` (uruchamianym przy montowaniu), `DashboardView` sprawdzi, czy `isAuthenticated === true`. Jeśli tak, spróbuje odczytać dane (`sourceText`, `candidates`) z `sessionStorage`.
5. Jeśli dane zostaną znalezione w `sessionStorage`, komponent ustawi nimi swój wewnętrzny stan (np. `useState`) i **natychmiast usunie** te dane z `sessionStorage`, aby uniknąć ich ponownego ładowania przy kolejnych odświeżeniach strony przez zalogowanego użytkownika.

## 3. Logika Backendowa (API Endpoints - Astro)

Wszystkie endpointy API (`src/pages/api/auth/`) będą wymagały `export const prerender = false;`. Będą używać klienta Supabase udostępnionego przez middleware w `context.locals.supabase`. Do walidacji request body używany będzie Zod. Odpowiedzi błędne będą używać DTO `ApiErrorResponseDto`.

* **`POST /api/auth/login`:**
  * **Request Body:** `{ email: string, password: string }` (Walidacja Zod).
  * **Logika:** Wywołuje `context.locals.supabase.auth.signInWithPassword({ email, password })`.
  * **Odpowiedź (Sukces 200):** Pusta lub z podstawowymi danymi użytkownika (jeśli potrzebne). Supabase SDK automatycznie ustawi ciasteczko sesji (`Set-Cookie`).
  * **Odpowiedź (Błąd):** `401 Unauthorized` (nieprawidłowe dane), `400 Bad Request` (błąd walidacji), `500 Internal Server Error`.
* **`POST /api/auth/register`:**
  * **Request Body:** `{ email: string, password: string }` (Walidacja Zod - email, min. 4 znaki hasła).
  * **Logika:** Wywołuje `context.locals.supabase.auth.signUp({ email, password })`.
  * **Odpowiedź (Sukces 201):** Pusta lub z danymi użytkownika. Zakładając brak wymogu potwierdzenia email, Supabase zaloguje użytkownika i ustawi ciasteczko.
  * **Odpowiedź (Błąd):** `409 Conflict` (email istnieje), `400 Bad Request` (błąd walidacji, np. słabe hasło wg Supabase), `500 Internal Server Error`.
* **`POST /api/auth/logout`:**
  * **Request Body:** Brak.
  * **Logika:** Wywołuje `context.locals.supabase.auth.signOut()`.
  * **Odpowiedź (Sukces 204 No Content):** Pusta. Supabase SDK usunie ciasteczko sesji.
  * **Odpowiedź (Błąd):** `500 Internal Server Error`.
* **`POST /api/auth/forgot-password`:**
  * **Request Body:** `{ email: string }` (Walidacja Zod - email format).
  * **Logika:** Wywołuje `context.locals.supabase.auth.resetPasswordForEmail(email, { redirectTo: 'URL_DO_STRONY_RESETOWANIA' })`. `URL_DO_STRONY_RESETOWANIA` musi być skonfigurowany w ustawieniach Supabase Auth i prowadzić do `/reset-password`.
  * **Odpowiedź (Sukces 204 No Content):** **Zawsze** zwraca sukces (nawet jeśli email nie istnieje), aby zapobiec enumeracji adresów email.
  * **Odpowiedź (Błąd):** `429 Too Many Requests` (rate limiting Supabase), `500 Internal Server Error`.
* **`POST /api/auth/reset-password`:**
  * **Request Body:** `{ token: string, newPassword: string }` (Walidacja Zod - min. 4 znaki hasła). Token pochodzi z linku email.
  * **Logika:**
        1. **Ważne:** Ten endpoint musi działać dla użytkownika *niezalogowanego* (bo właśnie resetuje hasło). Middleware nie powinno go blokować.
        2. Weryfikacja tokenu i aktualizacja hasła odbywa się przez Supabase. Najpierw trzeba wymienić kod z URL na sesję tymczasową, a potem zaktualizować użytkownika.
            **Alternatywa 1 (Preferowana z API):* Strona `/reset-password.astro` odczytuje `code` z URL, wywołuje `supabase.auth.exchangeCodeForSession(code)` po stronie serwera, uzyskuje `access_token` i przekazuje go do komponentu React. Komponent React wysyła `access_token` i `newPassword` do `POST /api/auth/reset-password`. Endpoint API używa tego `access_token` do stworzenia tymczasowego klienta Supabase (`createClient(..., ..., { global: { headers: { Authorization:`Bearer ${accessToken}`} } })`) i wywołuje `tempSupabase.auth.updateUser({ password: newPassword })`.
            * *Alternatywa 2 (Logika na stronie Astro):* Strona `/reset-password.astro` odczytuje `code`, wywołuje `supabase.auth.exchangeCodeForSession(code)` server-side. Jeśli sukces, przekazuje informację do komponentu React, który *tylko* zbiera nowe hasło. Po submisji formularza React, wywołuje *nowy* endpoint API (np. `POST /api/auth/update-password-from-session`), który używa *już istniejącej sesji* (uzyskanej z `exchangeCodeForSession`) do wywołania `context.locals.supabase.auth.updateUser({ password: newPassword })`. To wydaje się bardziej skomplikowane. **Trzymajmy się Alternatywy 1.**
  * **Odpowiedź (Sukces 200):** Pusta.
  * **Odpowiedź (Błąd):** `400 Bad Request` (nieprawidłowy/wygasły token, błąd walidacji hasła), `500 Internal Server Error`.

## 4. System Autentykacji (Integracja Supabase & Astro)

* **Konfiguracja Supabase:**
  * Włączyć dostawcę Email/Password.
  * Ustawić "Site URL" (np. `http://localhost:3001` dla dev, URL produkcyjny dla prod).
  * Ustawić "Redirect URLs" - dodać URL strony resetowania hasła (np. `http://localhost:3001/reset-password`).
  * Wyłączyć (jeśli niepotrzebne) potwierdzenie email dla uproszczenia przepływu rejestracji (zgodnie z PRD - auto-login po rejestracji).
  * Wyłączyć zewnętrznych dostawców (Google, GitHub etc.).
* **Middleware Astro (`src/middleware/index.ts`):**
  * **Inicjalizacja Klienta:** Na początku każdego żądania tworzy serwerowego klienta Supabase, używając ciasteczek z `Astro.cookies`.
  * **Pobieranie Sesji/Użytkownika:** Wywołuje `supabase.auth.getSession()` i `supabase.auth.getUser()`.
  * **Udostępnianie w Kontekście:** Zapisuje `session`, `user` i instancję `supabase` do `context.locals`.
  * **Ochrona Ścieżek:**
    * Sprawdza `context.locals.session` i `Astro.url.pathname`.
    * Jeśli `!session` i ścieżka to `/flashcards`, `/review`, `/settings`, wykonuje `context.redirect('/login', 307)`.
  * **Przekierowanie Zalogowanych:**
    * Jeśli `session` istnieje i ścieżka to `/login` lub `/register`, wykonuje `context.redirect('/', 307)`.
  * **Przekazanie Żądania:** Jeśli żadne przekierowanie nie jest wymagane, wywołuje `next()`.
* **Obsługa Ciasteczek:** Polegamy na Supabase JS SDK (`@supabase/ssr` dla Astro), które automatycznie zarządza odczytem i zapisem bezpiecznych ciasteczek sesji (`sb-*-auth-token`) w odpowiedziach API i odczytem w middleware.

## 5. Konfiguracja Astro

* Upewnić się, że w `astro.config.mjs` ustawiony jest tryb renderowania wspierający SSR: `output: 'server'` lub `output: 'hybrid'`.

## 6. Podsumowanie Kluczowych Zmian

* Dodanie nowych stron Astro dla przepływów logowania, rejestracji i odzyskiwania hasła.
* Dodanie nowych komponentów React dla formularzy autentykacji.
* Modyfikacja `Layout.astro` w celu dynamicznego wyświetlania kontrolek autentykacji i paska bocznego.
* Modyfikacja `index.astro` i potencjalnie innych stron w celu przekazania stanu `isAuthenticated` do komponentów React.
* Implementacja endpointów API w Astro (`/api/auth/*`) do obsługi logiki Supabase Auth.
* Rozbudowa middleware Astro o logikę ochrony ścieżek i przekierowań.
* Konfiguracja Supabase Auth.
* Zapewnienie renderowania SSR dla stron związanych z autentykacją.
* Dodanie logiki obsługi `sessionStorage` w `DashboardView` w celu zachowania stanu gościa po logowaniu/rejestracji (US-014).
