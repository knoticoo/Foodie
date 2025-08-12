#!/usr/bin/env bash
set -euo pipefail

# Stop or tear down all services defined in docker-compose.yml
# Usage examples:
#   ./stop_services.sh                   # Graceful stop (containers remain)
#   ./stop_services.sh --down            # Remove containers and network
#   ./stop_services.sh --down -v         # Also remove named/anonymous volumes
#   ./stop_services.sh --down --images local   # Also remove images built by compose
#   ./stop_services.sh --purge           # Down + remove local images + volumes + orphans
#   ./stop_services.sh --help

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "[!] Docker is not installed. Run: sudo ./install_ubuntu_deps.sh" >&2
  exit 1
fi

SHOW_HELP=false
DO_DOWN=false
REMOVE_VOLUMES=false
REMOVE_ORPHANS=false
RMI_MODE=""

print_help() {
  cat <<'EOF'
Stop or tear down services with Docker Compose

Options:
  --down                 Use 'docker compose down' instead of 'stop' (removes containers and network)
  -v, --volumes          With --down, also remove named and anonymous volumes
  --images MODE          With --down, remove images. MODE is 'all' or 'local'
  --remove-orphans       With --down, remove containers for services not in the compose file
  --purge                Shortcut for: --down --images local --volumes --remove-orphans
  -h, --help             Show this help and exit

Notes:
- Default action is a graceful stop (containers remain and can be restarted quickly).
- To fully clean up, use --down, and add -v/--images/--remove-orphans as needed.
EOF
}

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --down)
      DO_DOWN=true
      shift
      ;;
    -v|--volumes)
      REMOVE_VOLUMES=true
      shift
      ;;
    --images)
      if [[ $# -lt 2 ]]; then
        echo "[!] --images requires a value: 'all' or 'local'" >&2
        exit 1
      fi
      case "$2" in
        all|local) RMI_MODE="$2" ;;
        *) echo "[!] --images value must be 'all' or 'local'" >&2; exit 1 ;;
      esac
      shift 2
      ;;
    --remove-orphans)
      REMOVE_ORPHANS=true
      shift
      ;;
    --purge)
      DO_DOWN=true
      REMOVE_VOLUMES=true
      REMOVE_ORPHANS=true
      RMI_MODE="local"
      shift
      ;;
    -h|--help)
      SHOW_HELP=true
      shift
      ;;
    *)
      echo "[!] Unknown option: $1" >&2
      SHOW_HELP=true
      shift
      ;;
  esac
done

if [[ "$SHOW_HELP" == true ]]; then
  print_help
  exit 0
fi

# If cleanup flags were passed without --down, promote to --down
if [[ "$DO_DOWN" == false ]] && { [[ "$REMOVE_VOLUMES" == true ]] || [[ -n "$RMI_MODE" ]] || [[ "$REMOVE_ORPHANS" == true ]]; }; then
  DO_DOWN=true
fi

# Ensure we are in the repository root containing docker-compose.yml
if [[ ! -f docker-compose.yml ]]; then
  echo "[!] docker-compose.yml not found in $REPO_DIR" >&2
  exit 1
fi

if [[ "$DO_DOWN" == true ]]; then
  echo "[+] Bringing stack down..."
  DOWN_ARGS=(down)
  if [[ "$REMOVE_VOLUMES" == true ]]; then
    DOWN_ARGS+=("-v")
  fi
  if [[ -n "$RMI_MODE" ]]; then
    DOWN_ARGS+=("--rmi" "$RMI_MODE")
  fi
  if [[ "$REMOVE_ORPHANS" == true ]]; then
    DOWN_ARGS+=("--remove-orphans")
  fi
  docker compose "${DOWN_ARGS[@]}"
else
  echo "[+] Stopping services (containers will remain and can be restarted)..."
  docker compose stop
fi

# Display status after action
echo "[i] Current compose status:"
docker compose ps | cat