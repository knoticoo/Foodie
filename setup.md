### Prerequisites
- A fresh Ubuntu 22.04 or 24.04 VPS (user with sudo)
- A public IP or domain name pointing to the server (optional but recommended)

### 1) Update the system
```bash
sudo apt update && sudo apt -y upgrade
sudo reboot
```

### 2) Install Docker Engine and Compose plugin
```bash
# Install required packages
sudo apt -y install ca-certificates curl gnupg lsb-release

# Add Docker’s official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $UBUNTU_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine and Compose plugin
sudo apt update
sudo apt -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker
sudo systemctl enable docker
sudo systemctl start docker

# Optional: run Docker without sudo (log out/in after this)
sudo usermod -aG docker $USER
```

Verify installation:
```bash
docker --version
docker compose version
```

### 3) Install Git and basic tools
```bash
sudo apt -y install git jq
```

### 4) Clone the repository
```bash
cd ~
# Replace with your repo if different
git clone /workspace /opt/recipes-app || true
# If the repo is remote, use:
# git clone https://your.git.repo/recipes-app.git /opt/recipes-app
cd /opt/recipes-app
```

If you’re already on the server with the project in `/opt/recipes-app`, just `cd` into it.

### 5) Configure environment
```bash
cp .env.example .env

# Edit with your actual public IP or domain
sed -i "s|YOUR_PUBLIC_IP_OR_DOMAIN|YOUR.PUBLIC.IP.OR.DOMAIN|g" .env

# Open and adjust secrets as needed
nano .env
```
Notes:
- `API_HOST` is already `0.0.0.0` to listen on all interfaces (no localhost assumptions).
- If you do NOT want PostgreSQL exposed publicly, remove `"5432:5432"` from `docker-compose.yml` or block it in the firewall.

### 6) Build and start the stack
```bash
docker compose up -d --build
```
This will start:
- API (Express TS) on port 3000
- Admin Web (Nginx) on port 5173
- Static images (Nginx) on port 8080
- PostgreSQL on port 5432 (if exposed)

Notes:
- API writes uploaded images to `/app/uploads/images` which is bind-mounted to `nginx/static/images`, so files are served publicly at `/images/...`.

### 7) Open firewall (UFW)
If UFW is enabled, allow needed ports:
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp      # if you run a reverse proxy later
sudo ufw allow 3000/tcp    # API (public)
sudo ufw allow 5173/tcp    # Admin Web (public)
sudo ufw allow 8080/tcp    # Static images (public)
# Optional, only if you need direct DB access from outside (generally avoid):
# sudo ufw allow 5432/tcp

sudo ufw enable
sudo ufw status
```

### 8) Verify services
Replace `YOUR.PUBLIC.IP.OR.DOMAIN` below.
```bash
# API health
curl -s http://YOUR.PUBLIC.IP.OR.DOMAIN:3000/api/health | jq

# Admin web (open in browser)
# http://YOUR.PUBLIC.IP.OR.DOMAIN:5173

# Static images root (open in browser)
# http://YOUR.PUBLIC.IP.OR.DOMAIN:8080/images/
```

### 9) Optional: Use a domain with HTTPS (Caddy reverse proxy)
For production, put a reverse proxy with TLS in front. Example Caddy container as an override (automatic Let’s Encrypt):

Create `docker-compose.override.yml`:
```yaml
services:
  caddy:
    image: caddy:2
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
    depends_on:
      - api
      - admin-web
      - static
```

Create `Caddyfile` in repo root (replace domain names):
```caddy
api.example.com {
  reverse_proxy api:3000
}

admin.example.com {
  reverse_proxy admin-web:5173
}

static.example.com {
  reverse_proxy static:80
}
```
Then run:
```bash
docker compose up -d --build
```
Ensure DNS A records point to your VPS for `api.example.com`, `admin.example.com`, `static.example.com`.

### 10) File storage for images
Static images are served from `nginx/static/images` mounted read-only into the Nginx container. To add images:
```bash
# On the host
cd /opt/recipes-app
mkdir -p nginx/static/images
# Copy files into this folder; they’ll be served at /images/
```

### 11) Maintenance
- View logs:
```bash
docker compose logs -f api
# or admin-web, static, db, scrapers
```
- Restart a service:
```bash
docker compose restart api
```
- Rebuild after code changes:
```bash
docker compose up -d --build
```
- Update Docker images and system:
```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y autoremove
```

### 12) Backups (PostgreSQL)
Postgres data is stored in the `db-data` Docker volume. To make a simple dump:
```bash
docker exec -t recipes_db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > ~/recipes_backup_$(date +%F).sql
```
To restore (example):
```bash
cat ~/recipes_backup_2024-01-01.sql | docker exec -i recipes_db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

### 13) Troubleshooting
- Ports already in use: change host ports in `docker-compose.yml` or stop conflicting services.
- Can’t reach from public Internet: verify firewall, cloud security groups, and that services bind to `0.0.0.0` (this project does by default).
- DB exposed: Prefer removing `5432:5432` mapping and use an admin tool via SSH tunnel instead.

### Versions matrix
- Node.js: 20-alpine (containers)
- PostgreSQL: 16 (container)
- Nginx: stable-alpine (admin web, static images)
- Backend (npm pinned):
  - bcryptjs 2.4.3, cors 2.8.5, dotenv 16.4.5, express 4.19.2, jsonwebtoken 9.0.2, pg 8.11.5, zod 3.23.8
  - dev: @types/node 20.12.12, @types/pg 8.15.5, typescript 5.4.5, ts-node 10.9.2, ts-node-dev 2.0.0
- Scrapers (npm pinned): dotenv 16.4.5, node-cron 3.0.3, pg 8.11.5, undici 6.19.8
- Admin Web (npm pinned): react 18.3.1, react-dom 18.3.1, vite 5.2.0, @vitejs/plugin-react 4.2.1, typescript 5.4.5, @types/react 18.3.3, @types/react-dom 18.3.0

Note: Dockerfiles use `npm ci` with lockfiles for reproducible builds.

### 14) Stripe (test mode)
- Set these in `.env` (test keys):
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
- Expose webhook URL publicly (for local dev use `stripe cli`; on VPS use your domain/IP):
  - Webhook endpoint: `POST http://YOUR.PUBLIC.IP.OR.DOMAIN:3000/api/billing/webhook`
  - Subscribe to events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
- Create Checkout Session:
```
curl -X POST http://YOUR.PUBLIC.IP.OR.DOMAIN:3000/api/billing/checkout \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"successUrl":"http://YOUR.PUBLIC.IP.OR.DOMAIN:5173","cancelUrl":"http://YOUR.PUBLIC.IP.OR.DOMAIN:5173"}'
```
- Open returned `url` to complete test subscription.
- Optional: Customer Portal URL:
```
curl -X POST http://YOUR.PUBLIC.IP.OR.DOMAIN:3000/api/billing/portal \
  -H "Authorization: Bearer YOUR_JWT" -H "Content-Type: application/json" \
  -d '{"returnUrl":"http://YOUR.PUBLIC.IP.OR.DOMAIN:5173"}'
```