# E-commerce Backend

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

1. **Klonowanie i instalacja zależności**

   ```
   git clone <adres-repo>
   cd ecommerce-backend
   npm install
   ```

2. **Przygotowanie bazy PostgreSQL**

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

## Endpointy

### Ogólne

| Metoda | Ścieżka | Opis                                                                    |
| ------ | ------- | ----------------------------------------------------------------------- |
| GET    | `/`     | prosty komunikat potwierdzający działanie API                           |
| POST   | `/init` | jednorazowa inicjalizacja tabeli `products` na podstawie JSON/CSV pliku |

### Produkty

| Metoda | Ścieżka         | Opis                                                                 |
| ------ | --------------- | -------------------------------------------------------------------- |
| GET    | `/products`     | zwraca wszystkie produkty z bazy                                     |
| GET    | `/products/:id` | pojedynczy produkt (404, gdy brak rekordu)                           |
| POST   | `/products`     | tworzy produkt na podstawie JSON-a (nazwa, cena, opis, FK kategorii) |
| PUT    | `/products/:id` | aktualizuje dane produktu                                            |
| DELETE | `/products/:id` | usuwa produkt i zwraca `{ "message": "Deleted" }`                    |

### Kategorie

| Metoda | Ścieżka       | Opis                                             |
| ------ | ------------- | ------------------------------------------------ |
| GET    | `/categories` | lista wszystkich kategorii z tabeli `categories` |

### Zamówienia

| Metoda | Ścieżka                      | Opis                                                            |
| ------ | ---------------------------- | --------------------------------------------------------------- |
| GET    | `/orders`                    | zwraca pełną listę zamówień wraz z pozycjami                    |
| GET    | `/orders/:id`                | szczegóły pojedynczego zamówienia                               |
| GET    | `/orders/user/:username`     | zamówienia przypisane do konkretnego użytkownika                |
| GET    | `/orders/status/:statusName` | zamówienia o wskazanym statusie (np. `ZREALIZOWANE`)            |
| PUT    | `/orders/:id`                | zmiana statusu – w body wymagane `{ "status": "ZATWIERDZONE" }` |

### Statusy

| Metoda | Ścieżka   | Opis                                     |
| ------ | --------- | ---------------------------------------- |
| GET    | `/status` | zwraca seedowaną listę statusów zamówień |

## Przegląd schematu bazy

- `users` – użytkownicy (rola domyślna `KLIENT`)
- `categories` – kategorie produktów
- `statuses` – statusy zamówień (seedowane)
- `products` – katalog produktów (nazwa, opis, cena, waga, FK do kategorii)
- `orders` – zamówienia z danymi kontaktowymi i statusem
- `order_items` – pozycje zamówień (FK do `orders` i `products`, ilość, cena jednostkowa)
- `opinions` – opinie powiązane z zamówieniami

Relacje mają zdefiniowane odpowiednie akcje `CASCADE/RESTRICT`, by chronić integralność danych.
