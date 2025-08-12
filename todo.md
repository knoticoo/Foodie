## Phase 1 – MVP Development (2–3 months)

- **Goal**: Fully working core app without advanced extras.
- **Features**:
  - [ ] Recipe browsing (search & filters)
  - [ ] Step-by-step cooking instructions with images
  - [ ] Ingredient list with unit conversion
  - [ ] User accounts & favorites
  - [ ] Basic grocery list generator
  - [ ] Data from self-built recipe database (scraped + open source)
  - [ ] Hosted entirely on VPS

---

## Phase 2 – Grocery Price Integration (1–2 months)

- **Goal**: Link recipes to actual Latvian store prices.
- **Features**:
  - [ ] Scraper for Rimi, Maxima, Barbora product pages
  - [ ] Price stored in PostgreSQL, updated weekly
  - [ ] Grocery list auto-calculates total cost
  - [ ] Ingredient substitution (cheapest brand)

---

## Phase 3 – Meal Planner & Personalization (2 months)

- **Goal**: Make the app part of user’s daily routine.
- **Features**:
  - [ ] Weekly meal planner calendar
  - [ ] Auto-generated shopping list from planned meals
  - [ ] Save dietary preferences (vegan, keto, traditional Latvian, budget-friendly)
  - [ ] Smart recipe recommendations based on cooking history

---

## Phase 4 – Community Features (2–3 months)

- **Goal**: User-driven content & engagement.
- **Features**:
  - [ ] User-submitted recipes (with image upload to VPS)
  - [ ] Ratings & comments
  - [ ] Seasonal challenges (e.g., Midsummer BBQ week)
  - [ ] Share recipes via link/social media

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
- [ ] Search by ingredient, diet, time, cost
- [ ] Traditional Latvian + modern recipes
- [ ] Portion scaling (2, 4, 6 servings)
- [ ] Nutrition info per portion

### Meal Planning
- [ ] Drag-and-drop meals to weekly calendar
- [ ] Auto shopping list generation
- [ ] Pantry mode (find recipes with what you already have)

### Grocery Prices
- [ ] Store integration (Rimi, Maxima, Barbora)
- [ ] Cheapest ingredient finder
- [ ] Price history (track sales)

### Personalization
- [ ] Save favorites
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