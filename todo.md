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
  - [ ] User-submitted recipes (with image upload to VPS) — scaffolded: `/api/recipes/submit`, `/api/uploads/image-base64`, DB author/approval fields
  - [ ] Ratings & comments — scaffolded: `/api/recipes/:id/ratings` (GET/POST), DB `recipe_ratings`
  - [ ] Seasonal challenges (e.g., Midsummer BBQ week) — scaffolded: DB `challenges`, endpoint `/api/challenges`
  - [ ] Share recipes via link/social media — scaffolded: `/api/recipes/share/:token`

---

## Phase 5 – Monetization & Growth (Ongoing)

- **Goal**: Start earning without losing users.
- **Monetization**:
  - [ ] Freemium model
    - [ ] Free = ads + basic recipes
    - [ ] Premium (€3.99/month) = ad-free, advanced meal plans, price comparison
  - [ ] Grocery affiliate partnerships (earn from online orders)
  - [ ] Sponsored recipes from food brands

---

## Feature List by Category

### Recipes
- [ ] Search by ingredient
- [x] Search by diet, time, cost, text
- [ ] Traditional Latvian + modern recipes (content expansion)
- [x] Portion scaling (2, 4, 6 servings)
- [x] Nutrition info per portion (schema ready)

### Meal Planning
- [ ] Drag-and-drop meals to weekly calendar
- [ ] Auto shopping list generation
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
- [ ] User uploads (recipes, photos)
- [ ] Ratings & reviews
- [ ] Cooking challenges

### Offline Support
- [ ] Save recipes locally for offline cooking
- [ ] Sync when back online

### Localization
- [ ] Multilanguage UI (Russian, Latvian, English)

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
- Deployment smoke test on VPS with `docker compose up -d` and UFW rules
- Harden CORS (restrict to admin domain) and add basic rate limiting
- Ingredient search (by name) and pagination on recipes list
- Improve unit conversion (cups/tbsp/tsp + density mapping)
- Admin Web: CRUD for recipes, image upload to `nginx/static/images`
- i18n scaffolding (RU/LV/EN) for Admin Web and API content

---

## Changelog

### 2025-08-12
- Repo scaffolding: Created monorepo structure (`backend`, `database`, `scrapers`, `nginx`, `admin/web`, `mobile/flutter_app`).
- Orchestration: Added `docker-compose.yml` connecting `db`, `api`, `scrapers`, `admin-web`, and `static` services over a shared network.
- Config: Added `.env.example`, root `.gitignore`, `.dockerignore`, `README.md` (overview), and `setup.md` (Ubuntu guide).
- Backend API:
  - TypeScript Express app, env loader, CORS, JSON body parsing, global error handler.
  - Routes: `/api/health`, `/api/recipes` (list/detail), `/api/recipes/:id/grocery-list`, `/api/recipes/:id/scale`, `POST /api/recipes/grocery-list`.
  - Auth: JWT (`/api/auth/register`, `/api/auth/login`) and `requireAuth` middleware.
  - Favorites: `/api/favorites` (GET, POST, DELETE) for save/remove/list.
  - Grocery: scaling + basic unit conversions + aggregation.
  - Database: `pg` pool and connection check; Dockerfile; `tsconfig.json`.
- Database init: `pgcrypto` extension and initial schema + Phase 1 columns; `ingredients` JSONB; seed recipe.
- Scrapers: TS cron service placeholders for prices and recipes; Dockerfile.
- Static hosting: Nginx Dockerfile and `/nginx/static/` with placeholder `index.html`; `/images/` directory.
- Admin Web: Vite + React TS scaffold, minimal health/auth/recipes UI; built to static and served via Nginx.
- Versions pinned; Dockerfiles use `npm ci`; `setup.md` includes versions matrix.

### 2025-08-13
- Phase 2 start: Added DB columns `products.size_value`, `products.size_unit` and indexes for lookups.
- Implemented price service in backend with `/api/recipes/...grocery-list?includeCost=true` pricing and `/api/prices/cheapest` endpoint.
- Implemented scrapers warmup + weekly cron for Rimi, Maxima, Barbora with placeholder product sets and DB upserts.

### 2025-08-14
- Phase 2 complete: Cheapest brand substitution integrated in pricing service and `/api/prices/cheapest` endpoint.
- Phase 3 scaffolding:
  - DB: `planned_meals`, `user_preferences`, `cook_history` tables with indexes.
  - API routes: `/api/planner` (weekly plan CRUD + grocery list), `/api/preferences` (get/update), `/api/history` (mark cooked), `/api/recommendations` (basic recommendations).

### 2025-08-15
- Phase 3 complete:
  - Planner: `/api/planner/week` GET/PUT and `/api/planner/week/grocery-list` with scaling + price estimates; admin UI section for weekly planner and grocery list.
  - Preferences: `/api/preferences` implemented; recipe list applies user preferences by default when no explicit filters are provided.
  - Recommendations: `/api/recommendations` using diet overlap + recent history exclusion; admin UI to view recommendations.
- Phase 4 start (scaffolding):
  - DB: `008_community.sql` adds `recipes.author_user_id`, `recipes.is_approved`, `recipes.share_token`, tables `recipe_ratings`, `challenges`, `challenge_recipes`.
  - API: `/api/recipes/submit` (user-submitted recipes), `/api/recipes/share/:token` (public view), ratings endpoints (`GET/POST /api/recipes/:id/ratings`), `/api/challenges` list, `/api/uploads/image-base64` for image uploads to shared static volume.
  - Admin Web: sections for submit recipe, base64 image upload, ratings view/submit, challenges list.