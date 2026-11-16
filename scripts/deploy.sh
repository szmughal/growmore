#!/usr/bin/env bash
# ==========================================================
# Grow More and Stable Life - Production Deployment Script
# Zero-Downtime Docker Container Rolling Update
# ==========================================================
set -euo pipefail

echo "========================================================"
echo "  Deploying Grow More and Stable Life Production Stack"
echo "========================================================"

if [ ! -f .env ]; then
    echo "ERROR: .env file not found. Copy .env.example to .env and configure secrets."
    exit 1
fi

echo "[1/4] Pulling base container images..."
docker-compose pull redis nginx || true

echo "[2/4] Building production images with standalone optimizations..."
docker-compose build --no-cache

echo "[3/4] Launching orchestrated services..."
docker-compose up -d --remove-orphans

echo "[4/4] Verifying healthchecks..."
sleep 10
docker-compose ps

echo "Checking backend health endpoint..."
curl -s -f http://localhost:8000/api/v1/health | grep '"status":"healthy"' || {
    echo "WARNING: Healthcheck did not immediately return healthy. Check logs via: docker-compose logs backend"
}

echo "========================================================"
echo "  Grow More and Stable Life successfully deployed!"
echo "  Frontend Web: http://localhost"
echo "  Backend API:  http://localhost/api/v1"
echo "  API Docs:     http://localhost/docs"
echo "========================================================"
