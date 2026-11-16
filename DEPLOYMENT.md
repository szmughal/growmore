# PRODUCTION DEPLOYMENT GUIDE
**Platform**: Grow More and Stable Life  
**Architecture**: FastAPI Async Backend + Next.js 14 App Router + Redis Distributed Cache + Nginx Gateway  
**Operating Systems**: Linux (Ubuntu 22.04 / 24.04 LTS, Debian 12, RHEL 9), Docker Containerized  

---

## 1. Architecture Overview

```
                                      Internet
                                         │
                                         ▼
                            ┌────────────────────────┐
                            │  Nginx Reverse Proxy   │ (Port 80/443 SSL)
                            │   Rate Limiter & SSE   │
                            └───────────┬────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
       ┌────────────────────────┐              ┌────────────────────────┐
       │   Next.js 14 Web UI    │              │   FastAPI App Server   │
       │  (Standalone Node.js)  │              │  (Uvicorn Multi-Worker)│
       │       Port 3000        │              │       Port 8000        │
       └────────────────────────┘              └───────────┬────────────┘
                                                           │
                                            ┌──────────────┴──────────────┐
                                            │                             │
                                            ▼                             ▼
                               ┌────────────────────────┐    ┌────────────────────────┐
                               │     Redis 7.2 Cache    │    │  Database (SQLite/PG)  │
                               │   (In-Memory Snapshots)│    │   (SQLAlchemy 2.0 ORM) │
                               └────────────────────────┘    └────────────────────────┘
```

---

## 2. Deployment Method A: Docker Compose (Recommended)

Docker Compose is the recommended production deployment approach. It packages the frontend, backend, Redis cache, and Nginx reverse proxy into isolated containers.

### Prerequisites
- Docker Engine $\ge 24.0$
- Docker Compose $\ge 2.20$
- A public domain pointing to your server's IP address (e.g., `growmore.pk`)

### Step-by-Step Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-org/grow-more-financial.git /var/www/growmore
   cd /var/www/growmore
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit with your secrets
   nano .env
   ```
   Generate a cryptographic secret:
   ```bash
   openssl rand -hex 32
   ```
   Paste this value into `SECRET_KEY` in `.env`.

3. **Deploy the Containers**:
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```
   Or run directly:
   ```bash
   docker-compose up -d --build
   ```

4. **Verify Container Health**:
   ```bash
   docker-compose ps
   ```
   Verify all containers show `Up` and `healthy`:
   ```bash
   curl -f http://localhost:8000/api/v1/health
   # Expected output: {"status":"healthy","database":"connected","timestamp":"..."}
   ```

5. **Set Up SSL/TLS with Let's Encrypt**:
   Install Certbot:
   ```bash
   sudo apt update && sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d growmore.pk -d www.growmore.pk
   ```

---

## 3. Deployment Method B: Bare-Metal / Ubuntu VPS (Systemd)

For high-throughput environments where running on native Linux bare metal without container virtualization is preferred:

### 1. Install System Dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3.12 python3.12-venv python3-pip nodejs npm redis-server nginx curl
```

### 2. Configure Backend Service
```bash
# Create dedicated user
sudo useradd -m -s /bin/bash growmore
sudo mkdir -p /var/www/growmore
sudo chown -R growmore:growmore /var/www/growmore

# Set up virtual environment
su - growmore
cd /var/www/growmore
python3.12 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### 3. Configure Systemd Service
Copy the systemd unit file:
```bash
sudo cp /var/www/growmore/systemd/growmore-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now growmore-backend
sudo systemctl status growmore-backend
```

### 4. Build and Run Frontend
```bash
cd /var/www/growmore/frontend
npm ci
npm run build
# Start with PM2 process manager
sudo npm install -g pm2
pm2 start "node .next/standalone/server.js" --name "growmore-frontend"
pm2 save
pm2 startup
```

### 5. Configure Nginx Reverse Proxy
```bash
sudo cp /var/www/growmore/nginx/nginx.conf /etc/nginx/sites-available/growmore
sudo ln -s /etc/nginx/sites-available/growmore /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 4. Database Backups & Maintenance

### Automated Daily SQLite Backup
Add a cron job to back up the database daily:
```bash
crontab -e
# Add:
0 2 * * * cp /app/data/growmore.db /var/backups/growmore_$(date +\%F).db
```

### Upgrading to PostgreSQL for Enterprise Scale
To switch to high-concurrency PostgreSQL:
1. Update `DATABASE_URL` in `.env`:
   ```bash
   DATABASE_URL="postgresql+asyncpg://growmore_user:your_password@localhost:5432/growmore_db"
   ```
2. Restart backend:
   ```bash
   docker-compose restart backend
   ```
   The SQLAlchemy lifespan hook will automatically initialize all 20 tables and run baseline seeders.

---

## 5. Monitoring & Operational Health

- **Live Market Telemetry**: `GET /api/v1/admin/market-ops`
- **System Healthcheck**: `GET /api/v1/health`
- **Cache Management**: Use the `/admin` portal or call `POST /api/v1/admin/market-ops/cache/clear`
- **Circuit Breaker Override**: Call `POST /api/v1/admin/market-ops/circuit-breakers/{service_name}/reset`
- **Live Logs**:
  ```bash
  docker-compose logs -f backend
  docker-compose logs -f frontend
  ```
