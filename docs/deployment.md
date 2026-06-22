# Deployment Guide

The Resume Parser AI platform is fully containerized and intended to be deployed using Docker and Docker Compose. This guide details deploying the application to a single-node Linux production server (e.g., AWS EC2, DigitalOcean Droplet).

## Prerequisites
- A Linux server (Ubuntu 22.04 LTS recommended)
- `docker` and `docker-compose` installed
- A registered domain name pointing to the server's IP
- NGINX or a similar reverse proxy (Optional but recommended for SSL termination)

## 1. Environment Configuration

Clone the repository to your production server:
```bash
git clone https://github.com/yashnishadh1/Resume-phaser.git
cd Resume-phaser/backend
```

Create a production `.env` file from the example:
```bash
cp .env.example .env
```

Open `.env` and configure the following critical values:
- `SECRET_KEY`: Generate a secure 32-byte string (`openssl rand -hex 32`).
- `POSTGRES_PASSWORD`: Set a strong database password.
- `BACKEND_CORS_ORIGINS`: Set to your production frontend URL (e.g., `["https://app.yourdomain.com"]`).
- `SENTRY_DSN`: Insert your Sentry DSN for error tracking.

## 2. Docker Compose Deployment

The backend provides a `docker-compose.yml` file that orchestrates:
1. `web`: FastAPI application via Uvicorn/Gunicorn.
2. `db`: PostgreSQL database.
3. `redis`: Redis broker for Celery.
4. `worker`: Celery asynchronous task processor.

Build and start the infrastructure in detached mode:
```bash
docker-compose up --build -d
```

### 3. Database Migrations

Once the containers are healthy, apply the Alembic database migrations to initialize the schema:
```bash
docker-compose exec web alembic upgrade head
```

## 4. Frontend Deployment (Static Hosting)

The frontend is a static React application built via Vite. It should be built locally or via CI/CD, and the resulting `dist/` directory deployed to a CDN or static host.

### Building
```bash
npm install
npm run build
```

### Hosting Options
- **Vercel / Netlify**: Simply link your GitHub repository. The build command is `npm run build` and output directory is `dist`.
- **AWS S3 / CloudFront**: Sync the `dist/` folder to an S3 bucket and distribute via CloudFront.

## 5. Reverse Proxy & SSL (Production Backend)

It is highly recommended to place the FastAPI container behind a reverse proxy like NGINX to handle SSL termination.

**Sample NGINX Config**:
```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
