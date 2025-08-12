#!/usr/bin/env bash
set -euo pipefail

# Launch all services (PostgreSQL, API, Scrapers, Admin Web, Static) using Docker Compose.
# This script is safe to re-run.

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "[!] Docker is not installed. Run: sudo ./install_ubuntu_deps.sh"
  exit 1
fi

# Ensure .env exists by deriving from example if present
if [[ ! -f .env ]]; then
  if [[ -f .env.example ]]; then
    echo "[i] Creating .env from .env.example"
    cp .env.example .env
    # Optional: make a sensible default for host to 0.0.0.0 where relevant
    sed -i "s|YOUR_PUBLIC_IP_OR_DOMAIN|127.0.0.1|g" .env || true
  else
    echo "[i] No .env.example found. Creating minimal .env with safe defaults."
    cat > .env <<'EOF'
# Minimal environment for local/first run
API_HOST=0.0.0.0
API_PORT=3000
CORS_ORIGIN=*
JWT_SECRET=please_change_me
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=recipes
POSTGRES_PASSWORD=recipes_password_change_me
POSTGRES_DB=recipes
# Stripe (test) optional
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
EOF
  fi
fi

# Create required host directories for bind mounts
mkdir -p nginx/static/images

# Pull/build and start containers
echo "[+] Building and starting services..."
docker compose up -d --build

# Optional health checks
echo "[+] Waiting for database health..."
# Compose has healthcheck for db; give some time for API to boot
sleep 5

API_URL="http://127.0.0.1:3000/api/health"
if command -v curl >/dev/null 2>&1; then
  echo "[+] Checking API health at ${API_URL}"
  set +e
  for i in {1..20}; do
    STATUS=$(curl -s -m 2 "$API_URL" || true)
    if [[ -n "$STATUS" ]]; then
      echo "[OK] API responded: $STATUS"
      break
    fi
    sleep 1
  done
  set -e
fi

echo "[+] Services should now be up:"
echo "    - API:         http://YOUR.PUBLIC.IP.OR.DOMAIN:3000"
echo "    - Admin Web:   http://YOUR.PUBLIC.IP.OR.DOMAIN:5173"
echo "    - Static imgs: http://YOUR.PUBLIC_IP_OR_DOMAIN:8080/images/"
echo ""
echo "Tip: adjust CORS_ORIGIN in .env to your admin domain(s)."