#!/usr/bin/env bash
set -euo pipefail

# This script installs Docker Engine, Docker Compose plugin, Node.js, Git, and other development tools on Ubuntu 22.04/24.04.
# It is idempotent and safe to re-run.

if [[ $(id -u) -ne 0 ]]; then
  echo "[!] Please run as root (e.g., sudo $0)"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "[1/8] Updating apt index and upgrading system packages..."
apt-get update -y
apt-get upgrade -y

echo "[2/8] Installing prerequisites..."
apt-get install -y ca-certificates curl gnupg lsb-release software-properties-common apt-transport-https

# Setup Docker repository
if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
  echo "[3/8] Adding Docker's official GPG key..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
fi

# Determine Ubuntu codename (e.g., jammy, noble)
UBUNTU_CODENAME=$(. /etc/os-release && echo "$UBUNTU_CODENAME")

if [[ ! -f /etc/apt/sources.list.d/docker.list ]]; then
  echo "[4/8] Adding Docker apt repository..."
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
fi

# Setup NodeSource repository for Node.js
if [[ ! -f /etc/apt/keyrings/nodesource.gpg ]]; then
  echo "[5/8] Adding Node.js official GPG key..."
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  chmod a+r /etc/apt/keyrings/nodesource.gpg
fi

if [[ ! -f /etc/apt/sources.list.d/nodesource.list ]]; then
  echo "[6/8] Adding Node.js apt repository..."
  NODE_MAJOR=20
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list
fi

echo "[7/8] Installing Docker Engine, Docker Compose plugin, and Node.js..."
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin nodejs

echo "[8/8] Enabling and starting Docker service..."
systemctl enable docker
systemctl start docker

# Install development tools and utilities
echo "[*] Installing additional development tools..."
apt-get install -y \
  git \
  jq \
  wget \
  unzip \
  zip \
  build-essential \
  python3 \
  python3-pip \
  vim \
  nano \
  htop \
  tree \
  ncdu

# Install global npm packages for development
echo "[*] Installing global npm packages..."
npm install -g npm@latest
npm install -g yarn
npm install -g typescript
npm install -g @vue/cli
npm install -g create-react-app
npm install -g nodemon
npm install -g pm2

# Add current non-root user to docker group for rootless usage (requires re-login)
CURRENT_USER=${SUDO_USER:-$(logname 2>/dev/null || echo "")}
if [[ -n "${CURRENT_USER}" ]]; then
  if ! id -nG "${CURRENT_USER}" | grep -qw docker; then
    echo "[i] Adding user '${CURRENT_USER}' to 'docker' group (you must log out/in for this to take effect)."
    usermod -aG docker "${CURRENT_USER}" || true
  fi
fi

# Versions
echo ""
echo "Installed versions:"
docker --version || true
docker compose version || true
node --version || true
npm --version || true
yarn --version || true
git --version || true
jq --version || true
python3 --version || true

echo ""
echo "Done. If your user was added to the 'docker' group, log out and back in (or reboot) before running Docker without sudo."