#!/usr/bin/env bash
set -euo pipefail

# This script installs Docker Engine, Docker Compose plugin, Git, and jq on Ubuntu 22.04/24.04.
# It is idempotent and safe to re-run.

if [[ $(id -u) -ne 0 ]]; then
  echo "[!] Please run as root (e.g., sudo $0)"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "[1/6] Updating apt index and upgrading system packages..."
apt-get update -y
apt-get upgrade -y

echo "[2/6] Installing prerequisites..."
apt-get install -y ca-certificates curl gnupg lsb-release

# Setup Docker repository
if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
  echo "[3/6] Adding Docker's official GPG key..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
fi

# Determine Ubuntu codename (e.g., jammy, noble)
UBUNTU_CODENAME=$(. /etc/os-release && echo "$UBUNTU_CODENAME")

if [[ ! -f /etc/apt/sources.list.d/docker.list ]]; then
  echo "[4/6] Adding Docker apt repository..."
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
fi

echo "[5/6] Installing Docker Engine and Compose plugin..."
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "[6/6] Enabling and starting Docker service..."
systemctl enable docker
systemctl start docker

# Helpful tools
apt-get install -y git jq

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
git --version || true
jq --version || true

echo ""
echo "Done. If your user was added to the 'docker' group, log out and back in (or reboot) before running Docker without sudo."