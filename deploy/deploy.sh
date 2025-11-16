#!/bin/bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}ℹ️  $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Get project path from environment or use default
PROJECT_PATH="${VPS_PROJECT_PATH:-$HOME/TenseAI}"
cd "$PROJECT_PATH" || { log_error "Failed to navigate to $PROJECT_PATH"; exit 1; }

log_info "📁 Project directory: $PROJECT_PATH"

# Pull latest changes
log_info "🔄 Pulling latest changes..."
git fetch origin main
git reset --hard origin/main

# Check if .env file exists
[ -f .env ] || { log_error ".env file not found! Please create it manually on the VPS."; exit 1; }
log_info "Using existing .env file"

# Docker deployment
log_info "🔨 Rebuilding Docker container..."
CONTAINER_NAME="tense-ai-app"
IMAGE_NAME="smicek/tenseai:latest"

# Stop and remove existing container if it exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  log_info "Stopping existing container..."
  docker stop "$CONTAINER_NAME" || true
  docker rm "$CONTAINER_NAME" || true
fi

# Build and run
log_info "Building Docker image..."
docker build -t "$IMAGE_NAME" .

log_info "Starting container..."
docker run -d \
  -p 3000:4321 \
  --env-file .env \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  "$IMAGE_NAME"

# Cleanup old images
log_info "🧹 Cleaning up old images..."
docker image prune -f

log_info "✅ Deployment completed!"
docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
