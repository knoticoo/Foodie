# Latvian Recipes Platform Monorepo

This repository contains a multi-service app: API backend, admin web, scrapers, static image hosting, and PostgreSQL database. Everything is dockerized and binds to 0.0.0.0 (no localhost assumptions) for public access on your VPS.

## Services
- API (Node/Express) on :3000
- Admin Web (React/Vite built, served by nginx) on :5173
- Public Web (React/Vite built, served by nginx) on :80
- Scrapers (Node workers)
- Static images (nginx) on :8080
- PostgreSQL on :5432

## Quick start
```bash
./launch_services.sh
```

## Notes
- All services listen on 0.0.0.0 inside containers.
- Do not hardcode localhost in client code; use environment variables for base URLs.
- Configure firewall to expose only required ports.
- Public site autodetects API at http://<host>:3000 by default; override with `VITE_API_BASE_URL` at build-time if needed.