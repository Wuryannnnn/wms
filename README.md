# The Infinite Cafe - Warehouse Management System

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-blue.svg)]()
[![JDK-17](https://img.shields.io/badge/JDK-17-green.svg)]()
[![Vue-3](https://img.shields.io/badge/Vue-3.2-brightgreen.svg)]()

**English** | [中文](./README_ZH.md)

The Infinite Cafe WMS is a warehouse management system for handling daily warehouse operations including receiving, shipping, transferring, and stocktaking. It provides inventory dashboards, stock alerts, and a data visualization screen, with web-based printing support for receipt/shipment orders.

## Features

- Warehouse Management: maintain warehouse and zone master data
- Item Management: manage item/material information
- Customer/Supplier Management: maintain contact and business partner data
- Inbound (Receiving): purchase receipt, outsourcing receipt, return receipt, with web printing
- Outbound (Shipping): sales shipment, outsourcing shipment, transfer shipment, with web printing
- Transfer: move inventory between warehouses
- Stocktaking: inventory counting and reconciliation
- Inventory Dashboard: view stock by warehouse, zone, and item dimensions
- Inventory History: full audit trail of all inventory operations
- Data Visualization: homepage dashboard with charts and KPIs

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                      Browser                         │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP :80
┌─────────────────────▼───────────────────────────────┐
│               Nginx (Frontend Container)             │
│  ┌────────────────────┐  ┌────────────────────────┐ │
│  │  Vue 3 Static Files │  │ /prod-api → Reverse    │ │
│  │  (Vite Build)       │  │ Proxy to Backend :8080 │ │
│  └────────────────────┘  └───────────┬────────────┘ │
└──────────────────────────────────────┼──────────────┘
                                       │
┌──────────────────────────────────────▼──────────────┐
│            Spring Boot Backend (Java 17)             │
│                                                      │
│  Sa-Token Auth  │  MyBatis-Plus ORM  │ Redisson Cache │
└─────────┬────────────────┬───────────────┬──────────┘
          │                │               │
    ┌─────▼─────┐   ┌─────▼─────┐  ┌─────▼─────┐
    │  MySQL 8   │   │  Redis 7  │  │    OSS     │
    │ Persistence│   │Session/   │  │ (Optional) │
    │            │   │  Cache    │  │            │
    └───────────┘   └───────────┘  └───────────┘
```

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Vue 3 + Vite | 3.2 |
| UI Library | Element Plus | 2.2 |
| State Management | Pinia | 2.0 |
| Backend | Spring Boot | 3.2.6 |
| ORM | MyBatis-Plus | 3.5.6 |
| Auth | Sa-Token + JWT | 1.37 |
| Cache | Redis + Redisson | 7 / 3.29 |
| Database | MySQL | 8.0 |
| Containerization | Docker + Docker Compose | - |
| CI/CD | GitHub Actions | - |

### Project Structure

```
wms/
├── docker-compose.yml              # Docker orchestration
├── deploy/
│   ├── setup.sh                    # Server initialization script
│   └── deploy.sh                   # Deployment script
├── wms/                            # Backend (Spring Boot)
│   ├── ruoyi-admin-wms/            # Main application entry
│   │   ├── Dockerfile
│   │   └── src/main/resources/
│   │       ├── application.yml     # Common config
│   │       ├── application-dev.yml # Development profile
│   │       └── application-prod.yml# Production profile (Docker)
│   ├── ruoyi-common/               # Common modules
│   ├── ruoyi-modules/              # Business modules
│   │   ├── ruoyi-system/           #   System management
│   │   └── ruoyi-generator/        #   Code generator
│   └── script/sql/wms.sql          # Database init script
└── WMS-VUE/                        # Frontend (Vue 3)
    ├── Dockerfile
    ├── nginx.conf                  # Nginx config
    └── src/
        ├── api/                    # API interfaces
        ├── views/                  # Pages
        ├── components/             # Components
        ├── store/                  # State management
        ├── router/                 # Routing
        └── utils/                  # Utilities
```

## Local Development

### Prerequisites

- JDK 17
- Maven 3.8+
- Node.js 18+
- MySQL 8.0
- Redis 7

### Start Backend

```bash
cd wms

# Configure database: edit ruoyi-admin-wms/src/main/resources/application-dev.yml
# Update MySQL and Redis connection settings

mvn clean package -DskipTests
java -jar ruoyi-admin-wms/target/ruoyi-admin-wms.jar
```

### Start Frontend

```bash
cd WMS-VUE

npm install
npm run dev

# Visit http://localhost:80
```

## Docker Deployment

The system is deployed via Docker Compose with 4 containers:

| Container | Image | Port | Description |
|-----------|-------|------|-------------|
| wms-mysql | mysql:8.0 | 3306 | Database, auto-imports wms.sql on first start |
| wms-redis | redis:7-alpine | 6379 | Cache and session store |
| wms-backend | Custom (Java 17) | 8080 | Spring Boot backend |
| wms-frontend | Custom (Nginx) | **80** | Frontend + reverse proxy |

### Deploy to Cloud Server

**1. Initialize Server** (Ubuntu 22.04, run once)

```bash
# Run from local machine - installs Docker, JDK 17, Maven, Git
ssh root@YOUR_SERVER_IP 'bash -s' < deploy/setup.sh
```

After installation, open **port 80** in your cloud provider's security group / firewall.

**2. Deploy Application**

```bash
ssh root@YOUR_SERVER_IP

# Clone repository
git clone https://github.com/Wuryannnnn/wms.git /opt/wms
cd /opt/wms

# One-click deploy
bash deploy/deploy.sh
```

**3. Verify**

```bash
docker compose ps              # All 4 services should be Up
docker compose logs backend    # Look for "Started" message
```

Visit `http://YOUR_SERVER_IP` in a browser to see the login page.

Default admin account: `admin`, password: `wuxiankafei@2026`

### Common Operations

```bash
cd /opt/wms

docker compose ps              # Check service status
docker compose logs -f         # Follow live logs
docker compose logs backend    # View backend logs
docker compose restart backend # Restart backend
docker compose down            # Stop all services
docker compose up -d           # Start all services
```

## CI/CD

The project uses GitHub Actions for continuous deployment. Pushing to the `main` branch automatically deploys to the server.

```
git push → GitHub Actions → SSH to server → pull code → build → docker compose up
```

### Setup

Add the following secrets in GitHub repository **Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|-------|
| `SERVER_HOST` | Server public IP |
| `SERVER_USER` | `root` |
| `SERVER_SSH_KEY` | SSH private key content |

Once configured, every push to `main` triggers automatic deployment. You can also trigger it manually from the GitHub Actions page (workflow_dispatch).

### CI/CD Flow

```
┌──────────┐     ┌──────────────────┐     ┌──────────────────┐
│ git push │────▶│  GitHub Actions   │────▶│   Cloud Server    │
│ to main  │     │                  │     │                  │
└──────────┘     │ 1. SSH to server │     │ 1. git pull      │
                 │ 2. Run deploy    │     │ 2. mvn package   │
                 │    commands      │     │ 3. docker compose│
                 └──────────────────┘     │    up --build    │
                                          └──────────────────┘
```

## Environment Configuration

| Environment | Profile | Config File | MySQL Host | Redis Host |
|-------------|---------|-------------|-----------|-----------|
| Development | dev | application-dev.yml | localhost:3307 | localhost:6379 |
| Production | prod | application-prod.yml | mysql:3306 (Docker internal) | redis:6379 (Docker internal) |

In production, services communicate over the Docker network using container names (`mysql`, `redis`) as hostnames.

## Repository

https://github.com/Wuryannnnn/wms.git

## License

[MIT](LICENSE)
