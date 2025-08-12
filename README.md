# Latvian Recipes Platform Monorepo

This repository contains a multi-service app: API backend, admin web, scrapers, static image hosting, and PostgreSQL database. Everything is dockerized and binds to 0.0.0.0 (no localhost assumptions) for public access on your VPS.

## Services
- API Backend: Node.js + Express (TypeScript)
- Database: PostgreSQL 16
- Scrapers: Node.js cron jobs (TypeScript)
- Static Server: Nginx serving images
- Admin Web: React + Vite (TypeScript)
- Mobile App: Flutter (source placeholder only)

## Quick Start
1. Copy env file:
```bash
cp .env.example .env
```
2. Edit `.env` with your secrets and public base URLs.
3. Build and start with Docker:
```bash
docker compose up -d --build
```
4. Services (default ports):
- API: http://YOUR_PUBLIC_IP:3000
- Admin Web: http://YOUR_PUBLIC_IP:5173
- Static Images: http://YOUR_PUBLIC_IP:8080/images/
- PostgreSQL: YOUR_PUBLIC_IP:5432

## Structure
```
backend/            # Express API (TS)
database/           # SQL init scripts
scrapers/           # Price + recipe scrapers (TS)
nginx/              # Static hosting (images)
admin/web/          # Admin dashboard (Vite + React)
mobile/flutter_app/ # Flutter app source (placeholder)
```

## Notes
- All services listen on 0.0.0.0 inside containers.
- Do not hardcode localhost in client code; use environment variables for base URLs.
- Configure firewall to expose only required ports.