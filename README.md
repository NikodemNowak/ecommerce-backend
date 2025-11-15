# E-commerce Backend

> **⚠️ UWAGA: To jest wersja deweloperska projektu.**

Prosty backend API do zarządzania produktami, kategoriami, zamówieniami i opiniami w systemie e-commerce. Serwer Express udostępnia endpointy HTTP, a Knex odpowiada za migracje i seedowanie bazy PostgreSQL.

## Stos technologiczny

- Node.js 18+
- Express 5
- Knex 0.21
- Bookshelf 1.2
- PostgreSQL 14+

## Wymagania wstępne

1. Zainstalowany Node.js (LTS 18+).
2. Lokalna instancja PostgreSQL z możliwością tworzenia baz i użytkowników.
3. Dostęp do terminala z `npm`/`npx`.

## Konfiguracja środowiska

Backend korzysta ze zmiennych środowiskowych (każda ma domyślną wartość):

| Zmienna       | Domyślnie | Znaczenie             |
| ------------- | --------- | --------------------- |
| `DB_USER`     | postgres  | użytkownik PostgreSQL |
| `DB_PASSWORD` | password  | hasło użytkownika     |
| `DB_NAME`     | ecommerce | nazwa bazy danych     |
| `PORT`        | 3000      | port serwera HTTP     |

## Struktura projektu

- `controllers/` – kontrolery Express (products, categories, orders, statuses)
- `db/` – inicjalizacja Knex + Bookshelf
- `migrations/` – definicje schematu bazy
- `models/` – miejsce na przyszłe modele Bookshelf
- `routes/` – katalog na modularne trasy
- `seeds/` – dane referencyjne
- `knexfile.js` – konfiguracja Knex CLI
- `server.js` – punkt wejścia aplikacji

## Uruchomienie krok po kroku

> **⚠️ WAŻNE: Jeśli masz starą wersję bazy danych, musisz ją usunąć i uruchomić migracje oraz seedy od nowa.**

1. **Klonowanie i instalacja zależności**

   ```
   git clone <adres-repo>
   cd ecommerce-backend
   npm install
   ```

2. **Przygotowanie bazy PostgreSQL**

   > **Uwaga:** Jeśli masz już istniejącą bazę danych z poprzedniej wersji, usuń ją przed kontynuacją:
   >
   > ```
   > DROP DATABASE IF EXISTS ecommerce;
   > ```

   ```
   CREATE DATABASE ecommerce;
   CREATE USER postgres WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE ecommerce TO postgres;
   ```

3. **Migracje bazy**

   ```
   npx knex migrate:latest --env development
   ```

4. **Seedowanie danych referencyjnych**

   ```
   npx knex seed:run --specific=seed_categories.js --env development
   npx knex seed:run --specific=seed_statuses.js --env development
   ```

5. **Start serwera**
   ```
   node server.js
   ```
   API nasłuchuje pod `http://localhost:3000` (można zmienić przez `PORT`).

6. **Dokumentacja API**
   
   Po uruchomieniu serwera, interaktywna dokumentacja Swagger/OpenAPI jest dostępna pod adresem:
   ```
   http://localhost:3000/docs
   ```
   
   Dokumentacja zawiera pełny opis wszystkich endpointów, schematów danych, walidacji i możliwość testowania API bezpośrednio z przeglądarki.

## Autentykacja

API wykorzystuje JWT (JSON Web Tokens) do autoryzacji. Większość endpointów wymaga tokenu Bearer w nagłówku `Authorization`.

### Endpointy autentykacji

| Metoda | Ścieżka    | Autoryzacja | Opis                       |
| ------ | ---------- | ----------- | -------------------------- |
| POST   | `/login`   | Brak        | Logowanie użytkownika      |
| POST   | `/refresh` | Brak        | Odświeżanie tokenu dostępu |

#### POST /login

- **Autoryzacja:** Brak (publiczny endpoint)
- **Body (JSON):**
  ```json
  {
    "username": "admin",
    "password": "admin"
  }
  ```
- **Walidacja:**
  - `username` – wymagane, niepuste
  - `password` – wymagane, niepuste
- **Odpowiedź sukcesu (200 OK):**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "ADMIN"
    }
  }
  ```
- **Odpowiedzi błędów:**
  - `400 Bad Request` – brakuje username lub password
  - `401 Unauthorized` – nieprawidłowe dane logowania

#### POST /refresh

- **Autoryzacja:** Brak (publiczny endpoint)
- **Body (JSON):**
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Walidacja:**
  - `refreshToken` – wymagane, niepuste
- **Odpowiedź sukcesu (200 OK):**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### Używanie tokenu

Wszystkie endpointy wymagające autoryzacji oczekują tokenu w nagłówku:

```
Authorization: Bearer <accessToken>
```

## Endpointy

### Produkty

| Metoda | Ścieżka                         | Autoryzacja          | Opis                                                            |
| ------ | ------------------------------- | -------------------- | --------------------------------------------------------------- |
| GET    | `/products`                     | Token Bearer         | zwraca wszystkie produkty z bazy                                |
| GET    | `/products/:id`                 | Token Bearer         | pojedynczy produkt (404, gdy brak rekordu)                      |
| GET    | `/products/:id/seo-description` | Token Bearer         | generuje SEO opis produktu przy użyciu AI (wymaga GROQ_API_KEY) |
| POST   | `/products`                     | Token Bearer + ADMIN | tworzy produkt na podstawie JSON-a                              |
| PUT    | `/products/:id`                 | Token Bearer + ADMIN | aktualizuje dane produktu                                       |

#### GET /products

- **Autoryzacja:** Wymagany token Bearer
- **Odpowiedź sukcesu (200 OK):** Tablica produktów z relacją kategorii

#### GET /products/:id

- **Autoryzacja:** Wymagany token Bearer
- **Parametry:**
  - `id` – ID produktu (liczba całkowita)
- **Odpowiedzi:**
  - `200 OK` – zwraca produkt z kategorią
  - `404 Not Found` – produkt nie istnieje

#### GET /products/:id/seo-description

- **Autoryzacja:** Wymagany token Bearer
- **Parametry:**
  - `id` – ID produktu (liczba całkowita)
- **Odpowiedź sukcesu (200 OK):**
  ```json
  {
    "product_id": 1,
    "product_name": "Laptop",
    "seo_description": "<html>...</html>"
  }
  ```
- **Odpowiedzi błędów:**
  - `400 Bad Request` – brak GROQ_API_KEY lub błąd generowania
  - `404 Not Found` – produkt nie istnieje

#### POST /products

- **Autoryzacja:** Wymagany token Bearer + rola ADMIN
- **Body (JSON):**
  ```json
  {
    "name": "Laptop",
    "description": "Wydajny laptop do pracy",
    "price": 2999.99,
    "weight": 1.5,
    "category_id": 1
  }
  ```
- **Walidacja:**
  - `name` – wymagane, niepusty string
  - `description` – wymagane, niepusty string
  - `price` – wymagane, liczba dodatnia
  - `weight` – wymagane, liczba dodatnia
  - `category_id` – wymagane, dodatnia liczba całkowita (musi istnieć w tabeli categories)
- **Odpowiedzi:**
  - `201 Created` – zwraca utworzony produkt
  - `400 Bad Request` – błędne dane wejściowe
  - `403 Forbidden` – brak uprawnień (nie jesteś ADMIN)

#### PUT /products/:id

- **Autoryzacja:** Wymagany token Bearer + rola ADMIN
- **Parametry:**
  - `id` – ID produktu (liczba całkowita)
- **Body (JSON):** Wszystkie pola opcjonalne (można zaktualizować tylko wybrane)
  ```json
  {
    "name": "Zaktualizowany laptop",
    "price": 2499.99
  }
  ```
- **Walidacja:** (podobnie jak POST, ale wszystkie pola opcjonalne)
  - `name` – opcjonalne, jeśli podane: niepusty string
  - `description` – opcjonalne, jeśli podane: niepusty string
  - `price` – opcjonalne, jeśli podane: liczba dodatnia
  - `weight` – opcjonalne, jeśli podane: liczba dodatnia
  - `category_id` – opcjonalne, jeśli podane: dodatnia liczba całkowita
- **Odpowiedzi:**
  - `200 OK` – zwraca zaktualizowany produkt
  - `400 Bad Request` – błędne dane wejściowe
  - `403 Forbidden` – brak uprawnień
  - `404 Not Found` – produkt nie istnieje

### Kategorie

| Metoda | Ścieżka       | Autoryzacja | Opis                                             |
| ------ | ------------- | ----------- | ------------------------------------------------ |
| GET    | `/categories` | Brak        | lista wszystkich kategorii z tabeli `categories` |

#### GET /categories

- **Autoryzacja:** Brak (publiczny endpoint)
- **Odpowiedź sukcesu (200 OK):** Tablica kategorii

### Zamówienia

| Metoda | Ścieżka                    | Autoryzacja          | Opis                                                                                             |
| ------ | -------------------------- | -------------------- | ------------------------------------------------------------------------------------------------ |
| GET    | `/orders`                  | Token Bearer + ADMIN | zwraca pełną listę zamówień wraz z pozycjami i opiniami                                          |
| GET    | `/orders/:id`              | Token Bearer         | szczegóły pojedynczego zamówienia (łącznie z opiniami)                                           |
| GET    | `/orders/user`             | Token Bearer         | zamówienia zalogowanego użytkownika                                                              |
| GET    | `/orders/user/:userId`     | Token Bearer         | zamówienia użytkownika (tylko własne lub ADMIN może zobaczyć inne)                               |
| GET    | `/orders/status/:statusId` | Token Bearer + ADMIN | zamówienia o wskazanym statusie według ID (np. `3` dla `ANULOWANE`)                              |
| POST   | `/orders`                  | Token Bearer         | tworzy nowe zamówienie                                                                           |
| PATCH  | `/orders/:id`              | Token Bearer + ADMIN | zmiana statusu – w body wymagane `{ "status": "ZATWIERDZONE" }` lub odpowiedni JSON Patch        |
| POST   | `/orders/:id/opinions`     | Token Bearer         | dodaje opinię do zamówienia (tylko właściciel zamówienia, status `ZREALIZOWANE` lub `ANULOWANE`) |

#### GET /orders

- **Autoryzacja:** Wymagany token Bearer + rola ADMIN
- **Odpowiedź sukcesu (200 OK):** Tablica wszystkich zamówień z relacjami (status, items, opinions, user)

#### GET /orders/:id

- **Autoryzacja:** Wymagany token Bearer
- **Parametry:**
  - `id` – ID zamówienia (liczba całkowita)
- **Odpowiedzi:**
  - `200 OK` – zwraca zamówienie z relacjami
  - `404 Not Found` – zamówienie nie istnieje

#### GET /orders/user

- **Autoryzacja:** Wymagany token Bearer
- **Opis:** Zwraca zamówienia zalogowanego użytkownika
- **Odpowiedź sukcesu (200 OK):** Tablica zamówień użytkownika

#### GET /orders/user/:userId

- **Autoryzacja:** Wymagany token Bearer
- **Parametry:**
  - `userId` – ID użytkownika (liczba całkowita)
- **Ograniczenia dostępu:**
  - Użytkownik może zobaczyć tylko swoje zamówienia
  - ADMIN może zobaczyć zamówienia dowolnego użytkownika
- **Odpowiedzi:**
  - `200 OK` – zwraca zamówienia użytkownika
  - `403 Forbidden` – próba zobaczenia zamówień innego użytkownika bez uprawnień ADMIN

#### GET /orders/status/:statusId

- **Autoryzacja:** Wymagany token Bearer + rola ADMIN
- **Parametry:**
  - `statusId` – ID statusu (liczba całkowita, np. `3` dla `ANULOWANE`)
- **Odpowiedź sukcesu (200 OK):** Tablica zamówień o wskazanym statusie

#### POST /orders

- **Autoryzacja:** Wymagany token Bearer
- **Body (JSON):**
  ```json
  {
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "unit_price": 99.99
      },
      {
        "product_id": 2,
        "quantity": 1,
        "unit_price": 149.99
      }
    ]
  }
  ```
- **Walidacja:**
  - `items` – wymagane, tablica z co najmniej jednym elementem
  - Każdy element `items`:
    - `product_id` (lub `productId`) – wymagane, dodatnia liczba całkowita (produkt musi istnieć)
    - `quantity` – wymagane, dodatnia liczba całkowita
    - `unit_price` (lub `unitPrice`) – wymagane, liczba dodatnia
- **Odpowiedzi:**
  - `201 Created` – zwraca utworzone zamówienie z relacjami
  - `400 Bad Request` – błędne dane wejściowe (np. pusty items, nieistniejący produkt)
- **Uwaga:** Zamówienie jest automatycznie przypisywane do zalogowanego użytkownika i otrzymuje status `NIEZATWIERDZONE`

#### PATCH /orders/:id

- **Autoryzacja:** Wymagany token Bearer + rola ADMIN
- **Parametry:**
  - `id` – ID zamówienia (liczba całkowita)
- **Body (JSON):** Możliwe formaty:
  ```json
  {
    "status": "ZATWIERDZONE"
  }
  ```
  lub JSON Patch:
  ```json
  [
    {
      "op": "replace",
      "path": "/status",
      "value": "ZATWIERDZONE"
    }
  ]
  ```
- **Walidacja:**
  - `status` – wymagane, nazwa statusu (np. "ZATWIERDZONE", "ZREALIZOWANE", "ANULOWANE") lub ID statusu
- **Ograniczenia biznesowe:**
  - Nie można zmienić statusu zamówienia anulowanego (`ANULOWANE`)
  - Nie można zmienić statusu zamówienia zrealizowanego (`ZREALIZOWANE`)
  - Nie można cofnąć statusu wstecz (np. z `ZATWIERDZONE` do `NIEZATWIERDZONE`)
- **Odpowiedzi:**
  - `200 OK` – zwraca zaktualizowane zamówienie
  - `400 Bad Request` – błędne dane wejściowe lub naruszenie reguł biznesowych
  - `403 Forbidden` – brak uprawnień
  - `404 Not Found` – zamówienie nie istnieje

#### POST /orders/:id/opinions

- **Endpoint:** `POST /orders/:id/opinions`
- **Autoryzacja:** Wymagany token Bearer. Opinie może dodać tylko użytkownik, który utworzył dane zamówienie.
- **Parametry:**
  - `id` – ID zamówienia (liczba całkowita)
- **Warunki biznesowe:**
  - Opinie można dodawać jedynie dla zamówień ze statusem `ZREALIZOWANE` lub `ANULOWANE`
  - Do każdego zamówienia można dodać tylko jedną opinię
- **Body (JSON):**
  ```json
  {
    "rating": 5,
    "content": "Profesjonalna obsługa – informacja o opóźnieniu przyszła od razu."
  }
  ```
- **Walidacja:**
  - `rating` – wymagane, liczba całkowita od 1 do 5
  - `content` – wymagane, niepusty tekst
- **Odpowiedzi:**
  - `201 Created` – zwraca utworzoną opinię
  - `400 Bad Request` – błędne dane wejściowe, opinia już istnieje lub zamówienie ma niedozwolony status
  - `403 Forbidden` – brak uprawnień (inny użytkownik niż autor zamówienia)
  - `404 Not Found` – wskazane zamówienie nie istnieje

### Statusy

| Metoda | Ścieżka   | Autoryzacja | Opis                                     |
| ------ | --------- | ----------- | ---------------------------------------- |
| GET    | `/status` | Brak        | zwraca seedowaną listę statusów zamówień |

#### GET /status

- **Autoryzacja:** Brak (publiczny endpoint)
- **Odpowiedź sukcesu (200 OK):** Tablica statusów zamówień

### Inicjalizacja produktów

| Metoda | Ścieżka | Autoryzacja          | Opis                                                                    |
| ------ | ------- | -------------------- | ----------------------------------------------------------------------- |
| POST   | `/init` | Token Bearer + ADMIN | jednorazowa inicjalizacja tabeli `products` na podstawie JSON/CSV pliku |

#### POST /init

- **Autoryzacja:** Wymagany token Bearer + rola ADMIN
- **Body:** Możliwe formaty:
  1. **Upload pliku (multipart/form-data):**
     - Pole `file` – plik JSON lub CSV (max 5MB)
  2. **JSON array bezpośrednio:**
     ```json
     [
       {
         "name": "Produkt 1",
         "description": "Opis",
         "price": 99.99,
         "weight": 0.5,
         "category_id": 1
       }
     ]
     ```
  3. **JSON z polem products:**
     ```json
     {
       "products": [...]
     }
     ```
- **Walidacja:** Każdy produkt musi spełniać wymagania jak w `POST /products`
- **Ograniczenia:**
  - Inicjalizacja może być wykonana tylko raz (jeśli w bazie są już produkty, zwróci błąd)
- **Odpowiedzi:**
  - `200 OK` – zwraca liczbę zainicjalizowanych produktów
    ```json
    {
      "message": "Successfully initialized 10 products",
      "count": 10
    }
    ```
  - `400 Bad Request` – błędne dane wejściowe
  - `403 Forbidden` – brak uprawnień
  - `409 Conflict` – produkty są już zainicjalizowane

## Przegląd schematu bazy

- `users` – użytkownicy (rola domyślna `KLIENT`)
- `categories` – kategorie produktów
- `statuses` – statusy zamówień (seedowane)
- `products` – katalog produktów (nazwa, opis, cena, waga, FK do kategorii)
- `orders` – zamówienia z danymi kontaktowymi i statusem
- `order_items` – pozycje zamówień (FK do `orders` i `products`, ilość, cena jednostkowa)
- `opinions` – opinie powiązane z zamówieniami

Relacje mają zdefiniowane odpowiednie akcje `CASCADE/RESTRICT`, by chronić integralność danych.
