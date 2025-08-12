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
    sed -i "s|YOUR_PUBLIC_IP_OR_DOMAIN|0.0.0.0|g" .env || true
  else
    echo "[i] No .env.example found. Creating minimal .env with safe defaults."
    cat > .env <<'EOF'
# Minimal environment for local/first run
API_HOST=0.0.0.0
API_PORT=3000
CORS_ORIGIN=*
# A random secret will be generated below if 'please_change_me'
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
  # Auto-generate a strong JWT_SECRET if placeholder is present
  if grep -q "^JWT_SECRET=please_change_me$" .env; then
    RANDOM_SECRET=$(head -c 32 /dev/urandom | base64 | tr -d '\n=/+' | head -c 48)
    sed -i "s|^JWT_SECRET=please_change_me$|JWT_SECRET=${RANDOM_SECRET}|" .env
    echo "[i] Generated JWT_SECRET in .env"
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

# Determine host to advertise to users
# Priority: PUBLIC_HOST env -> PUBLIC_IP_OR_DOMAIN env -> detected public IP -> first local IP -> 0.0.0.0
HOST_TO_ADVERTISE="${PUBLIC_HOST:-${PUBLIC_IP_OR_DOMAIN:-}}"
if [[ -z "${HOST_TO_ADVERTISE}" ]]; then
  DETECTED_PUBLIC=""
  if command -v curl >/dev/null 2>&1; then
    set +e
    DETECTED_PUBLIC=$(curl -s --max-time 2 https://ifconfig.me || curl -s --max-time 2 http://checkip.amazonaws.com)
    set -e || true
  fi
  if [[ -n "${DETECTED_PUBLIC}" ]]; then
    HOST_TO_ADVERTISE="${DETECTED_PUBLIC}"
  else
    # Fallback to first non-loopback local IP
    if command -v hostname >/dev/null 2>&1; then
      set +e
      FIRST_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
      set -e || true
      if [[ -n "${FIRST_IP:-}" ]]; then
        HOST_TO_ADVERTISE="${FIRST_IP}"
      fi
    fi
  fi
fi
HOST_TO_ADVERTISE="${HOST_TO_ADVERTISE:-0.0.0.0}"

# Helper: wrap IPv6 addresses in brackets for URLs
url_host() {
  local h="$1"
  if [[ "$h" == *:* && "$h" != \[*\] ]]; then
    echo "[$h]"
  else
    echo "$h"
  fi
}

# Healthcheck should try both IPv4 and IPv6 localhost, then advertised host
HEALTH_URLS=(
  "http://127.0.0.1:3000/api/health"
  "http://[::1]:3000/api/health"
)
# Add advertised host (properly bracket if IPv6)
FORMATTED_HOST=$(url_host "$HOST_TO_ADVERTISE")
HEALTH_URLS+=("http://${FORMATTED_HOST}:3000/api/health")

if command -v curl >/dev/null 2>&1; then
  echo "[+] Checking API health (IPv4/IPv6):"
  set +e
  for url in "${HEALTH_URLS[@]}"; do
    echo "    -> $url"
    STATUS=$(curl -s -m 3 "$url" || true)
    if [[ -n "$STATUS" ]]; then
      echo "[OK] API responded: $STATUS"
      break
    fi
  done
  set -e
fi

API_HOST_PRINT=$(url_host "$HOST_TO_ADVERTISE")

echo "[+] Services should now be up:"
echo "    - Public Web:  http://${API_HOST_PRINT}/"
echo "    - API:         http://${API_HOST_PRINT}:3000"
echo "    - Admin Web:   http://${API_HOST_PRINT}:5173"
echo "    - Static imgs: http://${API_HOST_PRINT}:8080/images/"

echo ""
echo "Tip: adjust CORS_ORIGIN in .env to your admin domain(s)."