#!/usr/bin/env bash
# deploy.sh — Local convenience script for running any environment with Docker Compose
# Usage: ./deploy.sh [dev|test|prod] [up|down|build|logs]

set -euo pipefail

ENV=${1:-dev}
ACTION=${2:-up}

case "$ENV" in
  dev|test|prod) ;;
  *) echo "❌ Unknown environment: '$ENV'. Use dev, test, or prod." && exit 1 ;;
esac

COMPOSE_FILE="docker-compose.${ENV}.yml"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "❌ Compose file not found: $COMPOSE_FILE"
  exit 1
fi

echo "🚀 Environment : $ENV"
echo "📄 Compose file: $COMPOSE_FILE"
echo "⚙️  Action      : $ACTION"
echo ""

case "$ACTION" in
  up)
    docker compose -f "$COMPOSE_FILE" up -d --build --remove-orphans
    echo ""
    echo "✅ Stack is up. Services:"
    docker compose -f "$COMPOSE_FILE" ps
    ;;
  down)
    docker compose -f "$COMPOSE_FILE" down
    echo "✅ Stack stopped."
    ;;
  build)
    docker compose -f "$COMPOSE_FILE" build
    echo "✅ Images built."
    ;;
  logs)
    docker compose -f "$COMPOSE_FILE" logs -f
    ;;
  *)
    echo "❌ Unknown action: '$ACTION'. Use up, down, build, or logs."
    exit 1
    ;;
esac
