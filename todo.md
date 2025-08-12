## Phase 1 – MVP Development (2–3 months)

- **Goal**: Fully working core app without advanced extras.
- **Features**:
  - [x] Recipe browsing (search & filters) — list with q/diet/maxTime/maxCost filters
  - [x] Step-by-step cooking instructions with images — fields exposed in API (`steps`, `images`)
  - [x] Ingredient list with unit conversion — scaling + basic unit aggregation (g/ml/pcs)
  - [x] User accounts & favorites — JWT auth (register/login) + favorites CRUD
  - [x] Basic grocery list generator — per-recipe and multi-recipe endpoints
  - [x] Data from self-built recipe database (scraped + open source) — initial schema + seed example
  - [x] Hosted entirely on VPS — Docker Compose + service Dockerfiles ready

---

## Phase 2 – Grocery Price Integration (1–2 months)

- **Goal**: Link recipes to actual Latvian store prices.
- **Features**:
  - [x] Scraper for Rimi, Maxima, Barbora product pages
  - [x] Price stored in PostgreSQL, updated weekly
  - [x] Grocery list auto-calculates total cost
  - [x] Ingredient substitution (cheapest brand)

---

## Phase 3 – Meal Planner & Personalization (2 months)

- **Goal**: Make the app part of user’s daily routine.
- **Features**:
  - [x] Weekly meal planner calendar
  - [x] Auto-generated shopping list from planned meals
  - [x] Save dietary preferences (vegan, keto, traditional Latvian, budget-friendly)
  - [x] Smart recipe recommendations based on cooking history

---

## Phase 4 – Community Features (2–3 months)

- **Goal**: User-driven content & engagement.
- **Features**:
  - [x] User-submitted recipes (with image upload to VPS) — `/api/recipes/submit`, `/api/uploads/image-base64`, DB author/approval fields
  - [x] Ratings & comments — `/api/recipes/:id/ratings` (GET/POST), `/api/recipes/:id/comments` (GET/POST/DELETE)
  - [x] Seasonal challenges (e.g., Midsummer BBQ week) — DB `challenges`, endpoints `/api/challenges`, admin CRUD under `/api/admin/challenges`
  - [x] Share recipes via link/social media — `/api/recipes/share/:token`

---

## Phase 5 – Monetization & Growth (Ongoing)

- **Goal**: Start earning without losing users.
- **Monetization**:
  - [x] Freemium scaffolding (premium gating, admin premium toggle, price comparison endpoint, affiliate links)
  - [x] Free = ads + basic recipes
  - [x] Premium (€3.99/month) = ad-free, advanced meal plans, price comparison
  - [x] Billing (Stripe) — Integrated with Checkout + Webhooks (test keys supported).

---

## Feature List by Category

### Recipes
- [x] Search by ingredient
- [x] Search by diet, time, cost, text
- [ ] Traditional Latvian + modern recipes (content expansion)
- [x] Portion scaling (2, 4, 6 servings)
- [x] Nutrition info per portion (schema ready)

### Meal Planning
- [ ] Drag-and-drop meals to weekly calendar
- [x] Auto shopping list generation
- [ ] Pantry mode (find recipes with what you already have)

### Grocery Prices
- [x] Store integration (Rimi, Maxima, Barbora)
- [x] Cheapest ingredient finder
- [x] Price history (track sales)

### Personalization
- [x] Save favorites
- [ ] Smart recommendations
- [ ] Seasonal recipe highlights

### Community
- [x] User uploads (recipes, photos)
- [x] Ratings & reviews
- [x] Cooking challenges

### Offline Support
- [ ] Save recipes locally for offline cooking
- [ ] Sync when back online

### Localization
- [x] Multilanguage UI (Russian, Latvian, English)

---

## VPS-Based Architecture Overview
- Backend: Node.js + Express API
- Database: PostgreSQL on VPS
- Scrapers: Node.js cron jobs → update grocery prices & new recipes weekly
- Image Hosting: Nginx static file server on VPS
- App Frontend: Flutter app calling API endpoints
- Admin Panel: Web dashboard to add/edit recipes & approve user submissions

---

## Project Policies
- Code commenting: All new code must include concise, meaningful comments and/or docstrings explaining purpose, inputs, outputs, and side effects.
- Documentation: Every significant change must be summarized in the Changelog below.
- No localhost: All services bind to `0.0.0.0` and use env-configured public base URLs.

---

## Next Up (post-Phase 1)
- [x] Deployment smoke test on VPS with `docker compose up -d` and UFW rules
- [x] Harden CORS (restrict to admin domain) and add basic rate limiting
- [x] Ingredient search (by name) and pagination on recipes list
- [x] Improve unit conversion (cups/tbsp/tsp + density mapping)
- [x] Admin Web: CRUD for recipes, image upload to `nginx/static/images`
- [x] i18n scaffolding (RU/LV/EN) for Admin Web and API content

---

## Changelog

### 2025-08-18
- Public Web:
  - Added Admin link in navbar (visible only for `is_admin` users via `/api/auth/me`).
  - Removed API health widget from Home page.
  - Added reusable `Modal` and `AdsBanner` components (ads hidden for premium users based on token).
  - Added pages: Submit Recipe, Preferences, Planner (with grocery list), Recommendations, Prices (cheapest + premium compare), Billing (Go Premium + Portal), Challenges.
  - Enhanced Recipe Detail with: favorites toggle, scaling, grocery list (premium-aware), ratings submit and list, comments list/add/delete, sponsor badge.
  - Recipes list now supports filters (q, ingredient, diet, maxTime, maxCost) and pagination.
- Admin Web:
  - Modernized styling with a lightweight stylesheet (cards, buttons, inputs, header), no new deps.
- API:
  - Added `GET /api/auth/me` returning `{ email, is_admin }` for the current user.
- Notes:
  - Follow-up: UI polish (modals/forms), recipe search filters, drag-and-drop planner, pantry mode, offline support.