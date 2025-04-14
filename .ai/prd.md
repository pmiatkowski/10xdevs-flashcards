# Dokument wymagań produktu (PRD) - Fiszki AI

## 1. Przegląd produktu

Fiszki AI to aplikacja internetowa zaprojektowana w celu usprawnienia procesu tworzenia fiszek edukacyjnych. Umożliwia użytkownikom generowanie fiszek za pomocą sztucznej inteligencji na podstawie wklejonego tekstu, a także tworzenie ich manualnie. Aplikacja zawiera podstawowe funkcje zarządzania fiszkami (przeglądanie, edycja, usuwanie), system kont użytkowników do przechowywania danych oraz integrację z gotowym algorytmem powtórek (spaced repetition). Celem jest zminimalizowanie czasu potrzebnego na tworzenie fiszek i zachęcenie do korzystania z efektywnych metod nauki.

## 2. Problem użytkownika

Manualne tworzenie wysokiej jakości fiszek edukacyjnych jest procesem czasochłonnym i żmudnym. Wymaga to od użytkownika nie tylko identyfikacji kluczowych informacji, ale także ich syntetyzowania i formatowania w odpowiedni sposób. Ten wysiłek często zniechęca do regularnego tworzenia i używania fiszek, mimo że są one uznawaną i efektywną metodą nauki, szczególnie w połączeniu z techniką spaced repetition. Brak szybkiego i łatwego sposobu na generowanie fiszek stanowi barierę dla wielu potencjalnych użytkowników.

## 3. Wymagania funkcjonalne

- RF-001: System kont użytkowników:
  - Rejestracja za pomocą adresu e-mail i hasła.
  - Walidacja formatu adresu e-mail podczas rejestracji.
  - Wymaganie minimalnej długości hasła (4 znaki) podczas rejestracji.
  - Logowanie użytkownika.
  - Możliwość usunięcia konta przez użytkownika (z krokiem potwierdzającym).
- RF-002: Manualne tworzenie fiszek:
  - Formularz z dwoma polami tekstowymi: "przód" i "tył".
  - Limit znaków dla pola "przód": 200 znaków.
  - Limit znaków dla pola "tył": 500 znaków.
  - Widoczny licznik znaków dla obu pól formularza.
  - Walidacja limitów znaków przeprowadzana przy próbie zapisu/wysłania formularza.
  - Wyświetlanie predefiniowanych komunikatów błędów walidacji osobno dla każdego pola (np. "Pole 'przód' przekroczyło limit znaków.").
  - Zapisanie utworzonej fiszki w bazie danych powiązanej z kontem użytkownika.
- RF-003: Generowanie fiszek przez AI:
  - Pole tekstowe do wklejenia przez użytkownika materiału źródłowego.
  - Przycisk inicjujący proces generowania fiszek przez AI na podstawie wklejonego tekstu.
  - Wygenerowane przez AI propozycje fiszek (kandydaci) prezentowane użytkownikowi do recenzji.
- RF-004: Recenzja kandydatów na fiszki (wygenerowanych przez AI):
  - Wyświetlanie listy kandydatów na fiszki.
  - Każdy kandydat oznaczony wizualnie ikoną "@" (rozmiar 16x16px) w celu odróżnienia od fiszek zaakceptowanych.
  - Możliwość edycji treści pól "przód" i "tył" każdego kandydata.
  - Możliwość akceptacji kandydata – powoduje zapisanie fiszki w bazie danych i usunięcie oznaczenia "@".
  - Możliwość odrzucenia kandydata – powoduje usunięcie propozycji bez zapisywania.
  - Walidacja limitów znaków (przód: 200, tył: 500) podczas edycji i próby akceptacji kandydata.
- RF-005: Zarządzanie fiszkami:
  - Wyświetlanie listy zapisanych fiszek użytkownika.
  - Możliwość edycji istniejących fiszek (z zachowaniem walidacji limitów znaków).
  - Możliwość usunięcia istniejących fiszek.
- RF-006: Integracja z algorytmem powtórek:
  - Przekazywanie zapisanych fiszek użytkownika do zewnętrznego, gotowego algorytmu spaced repetition (szczegóły integracji TBD, ale system musi być na to przygotowany).
  - Interfejs do przeprowadzania sesji powtórek zgodnie z logiką dostarczonego algorytmu.
- RF-007: Statystyki generowania fiszek:
  - System zbiera informacje o liczbie fiszek wygenerowanych przez AI.
  - System zbiera informacje o liczbie fiszek zaakceptowanych przez użytkownika spośród wygenerowanych przez AI.
  - Statystyki są dostępne dla użytkownika w formie podsumowania w panelu głównym.

## 4. Granice produktu

Następujące funkcjonalności celowo NIE wchodzą w zakres wersji MVP (Minimum Viable Product):

- Implementacja własnego, zaawansowanego algorytmu powtórek (np. na wzór algorytmów SM-2 używanych w SuperMemo czy Anki). Zamiast tego zostanie zintegrowany gotowy, prostszy mechanizm.
- Import fiszek lub materiałów źródłowych z plików w różnych formatach (np. PDF, DOCX, CSV, Anki pkg). Jedyną metodą wprowadzania danych do AI jest kopiuj-wklej.
- Funkcje społecznościowe, takie jak współdzielenie zestawów fiszek między użytkownikami, komentowanie czy ocenianie.
- Integracje z zewnętrznymi platformami edukacyjnymi, systemami LMS czy innymi narzędziami.
- Dedykowane aplikacje mobilne (iOS, Android). Produkt będzie dostępny wyłącznie jako aplikacja internetowa (web).
- Zaawansowane opcje formatowania tekstu w polach fiszek (np. pogrubienie, kursywa, listy).
- Mechanizmy tagowania lub kategoryzacji fiszek.
- Zaawansowane logowanie błędów walidacji po stronie serwera (poza standardowym logowaniem aplikacji).
- Konfigurowalne ustawienia interfejsu użytkownika.

## 5. Historyjki użytkowników

- ID: US-001
- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę móc założyć konto w aplikacji używając mojego adresu e-mail i hasła, abym mógł zapisywać i zarządzać moimi fiszkami.
- Kryteria akceptacji:
  - Formularz rejestracji zawiera pola na adres e-mail i hasło.
  - Walidacja sprawdza, czy podany e-mail ma poprawny format.
  - Walidacja sprawdza, czy hasło ma co najmniej 4 znaki.
  - Po pomyślnej rejestracji użytkownik jest zalogowany i przekierowany do panelu głównego.
  - W przypadku błędów walidacji (niepoprawny e-mail, za krótkie hasło) wyświetlane są odpowiednie komunikaty.
  - Adres e-mail musi być unikalny w systemie.

- ID: US-002
- Tytuł: Logowanie użytkownika
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się na moje konto używając adresu e-mail i hasła, abym miał dostęp do moich fiszek.
- Kryteria akceptacji:
  - Formularz logowania zawiera pola na adres e-mail i hasło.
  - Po podaniu poprawnych danych użytkownik jest zalogowany i przekierowany do panelu głównego.
  - W przypadku podania niepoprawnego e-maila lub hasła wyświetlany jest odpowiedni komunikat błędu.

- ID: US-003
- Tytuł: Usunięcie konta użytkownika
- Opis: Jako zarejestrowany użytkownik, chcę móc usunąć moje konto wraz ze wszystkimi moimi danymi (w tym fiszkami), jeśli zdecyduję się przestać korzystać z aplikacji.
- Kryteria akceptacji:
  - W ustawieniach konta dostępna jest opcja usunięcia konta.
  - Przed ostatecznym usunięciem konta wyświetlane jest okno dialogowe z prośbą o potwierdzenie.
  - Po potwierdzeniu, konto użytkownika oraz wszystkie powiązane z nim fiszki są trwale usuwane z systemu.
  - Użytkownik jest wylogowywany po usunięciu konta.

- ID: US-004
- Tytuł: Manualne tworzenie nowej fiszki
- Opis: Jako zalogowany użytkownik, chcę móc manualnie stworzyć nową fiszkę, wpisując tekst na jej przód i tył, abym mógł dodawać własne materiały do nauki.
- Kryteria akceptacji:
  - Dostępny jest formularz tworzenia fiszki z polami "przód" i "tył".
  - Pole "przód" akceptuje do 200 znaków.
  - Pole "tył" akceptuje do 500 znaków.
  - Widoczne są liczniki znaków dla obu pól, aktualizujące się podczas pisania.
  - Próba zapisu fiszki z przekroczonym limitem znaków w którymkolwiek polu skutkuje wyświetleniem błędu walidacji specyficznego dla danego pola.
  - Poprawnie wypełniona i zapisana fiszka pojawia się na liście moich fiszek.
  - Pola formularza są czyszczone po pomyślnym zapisaniu fiszki.

- ID: US-005
- Tytuł: Generowanie kandydatów na fiszki przez AI
- Opis: Jako zalogowany użytkownik, chcę móc wkleić tekst źródłowy i zlecić AI wygenerowanie propozycji fiszek, abym mógł szybko stworzyć bazę materiałów do nauki.
- Kryteria akceptacji:
  - Dostępne jest pole tekstowe do wklejenia tekstu źródłowego.
  - Dostępny jest przycisk "Generuj fiszki".
  - Po kliknięciu przycisku i przetworzeniu tekstu przez AI, wyświetlana jest lista kandydatów na fiszki (propozycji).
  - Każdy kandydat składa się z pola "przód" i "tył".
  - Każdy kandydat jest oznaczony ikoną "@" (16x16px).

- ID: US-006
- Tytuł: Recenzowanie (akceptacja) kandydata na fiszkę
- Opis: Jako zalogowany użytkownik, chcę móc przejrzeć kandydata na fiszkę wygenerowanego przez AI i zaakceptować go, jeśli jest poprawny, aby dodać go do mojej kolekcji fiszek.
- Kryteria akceptacji:
  - Na liście kandydatów widoczny jest przycisk "Akceptuj" dla każdego kandydata.
  - Po kliknięciu "Akceptuj", kandydat jest zapisywany jako standardowa fiszka w mojej kolekcji.
  - Po akceptacji, ikona "@" znika z widoku tej fiszki (lub fiszka jest przenoszona na główną listę).
  - Zaakceptowany kandydat znika z listy kandydatów do recenzji.

- ID: US-007
- Tytuł: Recenzowanie (odrzucenie) kandydata na fiszkę
- Opis: Jako zalogowany użytkownik, chcę móc odrzucić kandydata na fiszkę wygenerowanego przez AI, jeśli jest niepoprawny lub niepotrzebny, aby nie zaśmiecał mojej listy propozycji.
- Kryteria akceptacji:
  - Na liście kandydatów widoczny jest przycisk "Odrzuć" dla każdego kandydata.
  - Po kliknięciu "Odrzuć", kandydat jest trwale usuwany i nie jest zapisywany jako fiszka.
  - Odrzucony kandydat znika z listy kandydatów do recenzji.

- ID: US-008
- Tytuł: Recenzowanie (edycja) kandydata na fiszkę
- Opis: Jako zalogowany użytkownik, chcę móc edytować treść kandydata na fiszkę wygenerowanego przez AI przed jego akceptacją, aby poprawić ewentualne błędy lub dostosować go do moich potrzeb.
- Kryteria akceptacji:
  - Pola "przód" i "tył" kandydata są edytowalne.
  - Podczas edycji obowiązują te same limity znaków (przód: 200, tył: 500) i walidacja co przy tworzeniu manualnym.
  - Widoczne są liczniki znaków dla edytowanych pól.
  - Po edycji użytkownik może zaakceptować zmienionego kandydata (zgodnie z US-006) lub go odrzucić (zgodnie z US-007).
  - Próba akceptacji edytowanego kandydata z przekroczonym limitem znaków skutkuje błędem walidacji.

- ID: US-009
- Tytuł: Przeglądanie zapisanych fiszek
- Opis: Jako zalogowany użytkownik, chcę móc przeglądać listę moich zapisanych fiszek, abym mógł zobaczyć, co już mam w swojej kolekcji.
- Kryteria akceptacji:
  - Dostępna jest sekcja wyświetlająca wszystkie moje zapisane fiszki (zarówno stworzone manualnie, jak i zaakceptowane z AI).
  - Każda fiszka na liście pokazuje treść z pola "przód" i "tył".
  - Fiszki zaakceptowane z AI nie posiadają już ikony "@".

- ID: US-010
- Tytuł: Edycja istniejącej fiszki
- Opis: Jako zalogowany użytkownik, chcę móc edytować treść istniejącej, zapisanej fiszki, abym mógł poprawić błędy lub zaktualizować informacje.
- Kryteria akceptacji:
  - Przy każdej zapisanej fiszce na liście dostępna jest opcja "Edytuj".
  - Kliknięcie "Edytuj" otwiera formularz z załadowaną treścią pól "przód" i "tył" danej fiszki.
  - Podczas edycji obowiązują te same limity znaków (przód: 200, tył: 500) i walidacja co przy tworzeniu manualnym.
  - Widoczne są liczniki znaków.
  - Po zapisaniu zmian, zaktualizowana treść fiszki jest widoczna na liście.
  - Próba zapisu edytowanej fiszki z przekroczonym limitem znaków skutkuje błędem walidacji.

- ID: US-011
- Tytuł: Usuwanie istniejącej fiszki
- Opis: Jako zalogowany użytkownik, chcę móc usunąć zapisaną fiszkę, której już nie potrzebuję, aby utrzymać porządek w mojej kolekcji.
- Kryteria akceptacji:
  - Przy każdej zapisanej fiszce na liście dostępna jest opcja "Usuń".
  - Po kliknięciu "Usuń" (może być wymagane potwierdzenie), fiszka jest trwale usuwana z mojej kolekcji.
  - Usunięta fiszka znika z listy moich fiszek.

- ID: US-012
- Tytuł: Sesja powtórek (Spaced Repetition)
- Opis: Jako zalogowany użytkownik, chcę móc rozpocząć sesję powtórek moich fiszek zgodnie z algorytmem spaced repetition, abym mógł efektywnie utrwalać wiedzę.
- Kryteria akceptacji:
  - Dostępna jest opcja rozpoczęcia sesji powtórek.
  - Aplikacja prezentuje fiszki zgodnie z logiką dostarczonego algorytmu powtórek (np. pokazując przód fiszki).
  - Użytkownik ma możliwość odsłonięcia tyłu fiszki.
  - Użytkownik ma możliwość oceny swojej odpowiedzi (np. "łatwe", "trudne", "powtórz"), co wpływa na harmonogram kolejnych powtórek zgodnie z algorytmem.
  - Sesja trwa do momentu przetworzenia wszystkich zaplanowanych na dany moment fiszek lub do przerwania przez użytkownika.

- ID: US-013
- Tytuł: Odzyskiwanie hasła
- Opis: Jako zarejestrowany użytkownik, który zapomniał hasła, chcę móc zainicjować proces odzyskiwania hasła, abym mógł odzyskać dostęp do mojego konta.
- Kryteria akceptacji:
  - Na stronie logowania dostępna jest opcja "Zapomniałem hasła".
  - Po kliknięciu opcji i podaniu adresu e-mail powiązanego z kontem, system wysyła na ten adres e-mail link do resetowania hasła.
  - Link do resetowania hasła jest unikalny i ma ograniczony czas ważności.
  - Po kliknięciu w link, użytkownik jest przekierowywany na stronę, gdzie może ustawić nowe hasło.
  - Nowe hasło musi spełniać te same wymagania co przy rejestracji (minimum 4 znaki).
  - Po pomyślnym ustawieniu nowego hasła, użytkownik może zalogować się przy jego użyciu.
  - W przypadku podania adresu e-mail, który nie istnieje w systemie, wyświetlany jest ogólny komunikat (ze względów bezpieczeństwa, nie informujący wprost o braku konta).

- ID: US-014
- Tytuł: Generowanie kandydatów na fiszki przez AI dla niezalogowanego użytkownika
- Opis: Jako niezalogowany użytkownik, chcę móc wkleić tekst źródłowy i zlecić AI wygenerowanie propozycji fiszek, abym mógł wypróbować funkcjonalność aplikacji przed rejestracją.
- Kryteria akceptacji:
  - Na stronie głównej dostępna jest funkcjonalność generowania fiszek przez AI (pole tekstowe, przycisk "Generuj fiszki") dla niezalogowanych użytkowników.
  - Po kliknięciu przycisku i przetworzeniu tekstu przez AI, wyświetlana jest lista kandydatów na fiszki (propozycji), oznaczonych ikoną "@".
  - Przy liście kandydatów widoczne są przyciski/linki zachęcające do rejestracji lub logowania w celu zapisania, edycji lub akceptacji fiszek.
  - Funkcje edycji, akceptacji i odrzucania kandydatów są niedostępne (wyszarzone lub ukryte) dla niezalogowanego użytkownika.
  - Jeśli użytkownik zdecyduje się zalogować lub zarejestrować po wygenerowaniu kandydatów, wprowadzony tekst źródłowy oraz wygenerowani kandydaci zostają zachowani i są dostępni dla użytkownika po zalogowaniu.
  - Po zalogowaniu, użytkownik może normalnie zarządzać zachowanymi kandydatami (edytować, akceptować, odrzucać) zgodnie z US-006, US-007, US-008.

## 6. Metryki sukcesu

- MS-001: Wskaźnik akceptacji fiszek AI: Co najmniej 75% fiszek wygenerowanych przez AI i przedstawionych użytkownikowi do recenzji jest przez niego akceptowanych (ewentualnie po edycji).
- MS-002: Wykorzystanie AI do tworzenia fiszek: Co najmniej 75% wszystkich nowo utworzonych i zapisanych fiszek w systemie (po okresie wdrożenia) pochodzi z procesu generowania przez AI (czyli są to zaakceptowani kandydaci).
