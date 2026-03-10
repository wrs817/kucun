# Inventory Management System — Plan

## Overview

A full-stack inventory management system with authentication and database managed by **Supabase**. Built to track products, record incoming stock, and log sales — with automatic quantity updates driven by database triggers.

---

## Tech Stack

- **Frontend:** Vite + Vanilla TypeScript + Tailwind CSS
- **Backend / DB / Auth:** Supabase (PostgreSQL + Auth + Row Level Security)
- **ORM / Query:** Supabase JS client (`@supabase/supabase-js`)
- **Language:** TypeScript
- **Hosting:** Any static host (e.g. Netlify, Cloudflare Pages, GitHub Pages)

---

## Authentication

- Managed entirely by Supabase Auth
- Email/password sign-up and sign-in
- Client-side route guarding: check active Supabase session on page load, redirect to `/login.html` if unauthenticated
- Row Level Security (RLS) policies on all tables to restrict access to authenticated users

---

## Database Schema

### `products`

| Column              | Type      | Notes                              |
|---------------------|-----------|------------------------------------|
| `id`                | uuid (PK) | auto-generated                     |
| `user_id`           | uuid (FK) | references `auth.users.id`         |
| `name`              | text      | required                           |
| `reward_multiplier` | numeric   | e.g. 1.5x loyalty points           |
| `category`          | text      | e.g. "Electronics", "Food", etc.   |
| `quantity`          | integer   | current stock level, default 0     |
| `created_at`        | timestamp | auto-generated                     |

---

### `sales`

| Column       | Type      | Notes                                      |
|--------------|-----------|--------------------------------------------|
| `id`         | uuid (PK) | auto-generated                             |
| `user_id`    | uuid (FK) | references `auth.users.id`                 |
| `customer`   | text      | customer name or ID                        |
| `product_id` | uuid (FK) | references `products.id`                   |
| `sell_price` | numeric   | sell price at time of sale                 |
| `quantity`   | integer   | number of units sold                       |
| `sale_date`  | timestamp | defaults to `now()`                        |
| `created_at` | timestamp | auto-generated                             |

**Trigger:** After an `INSERT` on `sales`, a database trigger **deducts** `quantity` from the corresponding `products` row.

---

### `goods_in`

| Column           | Type      | Notes                                      |
|------------------|-----------|--------------------------------------------|
| `id`             | uuid (PK) | auto-generated                             |
| `user_id`        | uuid (FK) | references `auth.users.id`                 |
| `product_id`     | uuid (FK) | references `products.id`                   |
| `purchase_price` | numeric   | cost price at time of receipt              |
| `quantity`       | integer   | number of units received                   |
| `created_at`     | timestamp | defaults to `now()`                        |

**Trigger:** After an `INSERT` on `goods_in`, a database trigger **adds** `quantity` to the corresponding `products` row.

---

## Database Triggers (PostgreSQL)

### Deduct stock on sale

```sql
CREATE OR REPLACE FUNCTION deduct_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET quantity = quantity - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_stock
AFTER INSERT ON sales
FOR EACH ROW EXECUTE FUNCTION deduct_stock_on_sale();
```

### Add stock on goods in

```sql
CREATE OR REPLACE FUNCTION add_stock_on_goods_in()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET quantity = quantity + NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_add_stock
AFTER INSERT ON goods_in
FOR EACH ROW EXECUTE FUNCTION add_stock_on_goods_in();
```

---

## Application Pages / Features

### Auth
- `login.html` — Sign in page
- `register.html` — Sign up page
- Redirect unauthenticated users to `login.html`

### Dashboard
- `index.html` — Overview: total products, low stock alerts, recent sales, recent goods in

### Products
- `products.html` — List all products (filterable by category, searchable by name)
- `products-new.html` — Add a new product
- `products-edit.html?id=...` — View/edit a product (name, reward multiplier, category)

### Sales
- `sales.html` — List all sales records (filterable by date, customer, product)
- `sales-new.html` — Record a new sale (select product, enter customer name, quantity, date)

### Goods In
- `goods-in.html` — List all goods-in records (filterable by date, product)
- `goods-in-new.html` — Record new incoming stock (select product, quantity)

---

## Row Level Security (RLS) Policies

All tables have RLS enabled. Every policy checks `auth.uid() = user_id`, ensuring users can only access their own records.

### `products`
```sql
-- SELECT: own records only
CREATE POLICY "users can view own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: automatically set user_id to the logged-in user
CREATE POLICY "users can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: own records only
CREATE POLICY "users can update own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

-- DELETE: own records only
CREATE POLICY "users can delete own products" ON products
  FOR DELETE USING (auth.uid() = user_id);
```

### `sales`
```sql
CREATE POLICY "users can view own sales" ON sales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users can insert own sales" ON sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### `goods_in`
```sql
CREATE POLICY "users can view own goods_in" ON goods_in
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users can insert own goods_in" ON goods_in
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

> **Note:** The stock-update triggers run with `SECURITY DEFINER` so they can update `products.quantity` even though the trigger fires in the context of a `sales` or `goods_in` insert.

---

## Folder Structure

```
inventory_management/
├── src/
│   ├── pages/
│   │   ├── login.ts
│   │   ├── register.ts
│   │   ├── index.ts          # dashboard
│   │   ├── products.ts
│   │   ├── products-new.ts
│   │   ├── products-edit.ts
│   │   ├── sales.ts
│   │   ├── sales-new.ts
│   │   ├── goods-in.ts
│   │   └── goods-in-new.ts
│   ├── components/
│   │   ├── navbar.ts
│   │   ├── productTable.ts
│   │   ├── salesTable.ts
│   │   └── goodsInTable.ts
│   ├── lib/
│   │   └── supabase.ts       # Supabase client setup
│   ├── types/
│   │   └── index.ts          # TypeScript types for DB tables
│   └── auth.ts               # Session check / redirect helper
├── login.html
├── register.html
├── index.html
├── products.html
├── products-new.html
├── products-edit.html
├── sales.html
├── sales-new.html
├── goods-in.html
├── goods-in-new.html
├── .env                      # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── plans.md
```

---

## Implementation Steps

1. **Bootstrap project** — `npm create vite@latest` with Vanilla TypeScript + Tailwind CSS
2. **Set up Supabase project** — create project, get API keys
3. **Create DB schema** — run SQL migrations for `products`, `sales`, `goods_in` tables
4. **Add triggers** — run trigger SQL in Supabase SQL editor
5. **Enable RLS** — set policies on all tables
6. **Configure Supabase client** — `lib/supabase.ts` with env vars
7. **Auth flows** — login/register pages + middleware for protected routes
8. **Products CRUD** — list, create, edit pages
9. **Sales recording** — form to log a sale (triggers auto-update stock)
10. **Goods In recording** — form to log incoming stock (triggers auto-update stock)
11. **Dashboard** — summary stats and recent activity
12. **Polish** — loading states, error handling, low-stock warnings
