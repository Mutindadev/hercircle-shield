# HerCircle Shield Deployment Guide

## Overview

This guide covers deploying HerCircle Shield to production environments including Docker, Railway, Heroku, and manual server deployment.

---

## Prerequisites

Before deploying, ensure you have:

- Node.js 22+ installed
- pnpm 10+ package manager
- MySQL 8.0+ or TiDB database
- Domain name with SSL certificate
- API keys for Gemini and OpenAI
- Manus OAuth credentials

---

## Environment Variables

Configure the following environment variables for production:

### Required Variables

```bash
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your_secure_jwt_secret_minimum_32_characters
OAUTH_SERVER_URL=https://api.manus.im
VITE_APP_ID=your_manus_app_id

# AI Services
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Application
NODE_ENV=production
```

### Optional Variables

```bash
# Manus Built-in Services
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key

# Owner Information
OWNER_OPEN_ID=your_owner_open_id
OWNER_NAME=Your Name

# Analytics
VITE_ANALYTICS_ENDPOINT=your_analytics_endpoint
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

---

## Docker Deployment

### Step 1: Build Docker Images

```bash
# Clone repository
git clone https://github.com/your-org/hercircle-shield.git
cd hercircle-shield

# Build images
docker-compose build
```

### Step 2: Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
# Edit .env with your production values
nano .env
```

### Step 3: Start Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Step 4: Database Migration

```bash
# Run migrations
docker-compose exec backend pnpm db:push
```

### Step 5: Verify Deployment

```bash
# Check backend health
curl https://your-domain.com/api/trpc/auth.me

# Check WebSocket
# Open browser console and test connection
```

### Docker Management Commands

```bash
# Stop services
docker-compose down

# Restart services
docker-compose restart

# View backend logs
docker-compose logs -f backend

# View database logs
docker-compose logs -f db

# Update images
docker-compose pull
docker-compose up -d
```

---

## Railway Deployment

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### Step 2: Initialize Project

```bash
# In project directory
railway init

# Link to existing project or create new
railway link
```

### Step 3: Add Database

```bash
# Add MySQL plugin
railway add mysql

# Get database URL
railway variables
```

### Step 4: Configure Environment Variables

```bash
# Set variables via CLI
railway variables set GEMINI_API_KEY=your_key
railway variables set OPENAI_API_KEY=your_key
railway variables set JWT_SECRET=your_secret

# Or use Railway dashboard
railway open
# Navigate to Variables tab
```

### Step 5: Deploy

```bash
# Deploy to Railway
railway up

# View logs
railway logs

# Open in browser
railway open
```

### Railway Configuration

Create `railway.json` in project root:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "node dist/index.js",
    "healthcheckPath": "/api/trpc/auth.me",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Heroku Deployment

### Step 1: Install Heroku CLI

```bash
# Install CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login
```

### Step 2: Create Heroku App

```bash
# Create app
heroku create hercircle-shield

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Get database URL
heroku config:get JAWSDB_URL
```

### Step 3: Configure Environment

```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set GEMINI_API_KEY=your_key
heroku config:set OPENAI_API_KEY=your_key
heroku config:set JWT_SECRET=your_secret
heroku config:set DATABASE_URL=$(heroku config:get JAWSDB_URL)
```

### Step 4: Deploy

```bash
# Add Heroku remote
heroku git:remote -a hercircle-shield

# Deploy
git push heroku main

# Run migrations
heroku run pnpm db:push

# View logs
heroku logs --tail

# Open app
heroku open
```

### Heroku Configuration

Create `Procfile` in project root:

```
web: node dist/index.js
```

Create `app.json`:

```json
{
  "name": "HerCircle Shield",
  "description": "GBV Detection and Support System",
  "keywords": ["gbv", "safety", "ai-detection"],
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ],
  "env": {
    "NODE_ENV": {
      "value": "production"
    },
    "GEMINI_API_KEY": {
      "description": "Gemini API key for AI detection"
    },
    "OPENAI_API_KEY": {
      "description": "OpenAI API key for fallback detection"
    },
    "JWT_SECRET": {
      "description": "Secret for JWT token signing",
      "generator": "secret"
    }
  },
  "addons": [
    {
      "plan": "jawsdb:kitefin"
    }
  ]
}
```

---

## Manual Server Deployment

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

### Step 2: Clone and Build

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/your-org/hercircle-shield.git
cd hercircle-shield

# Install dependencies
pnpm install

# Build application
pnpm build
```

### Step 3: Configure Environment

```bash
# Create .env file
sudo nano .env
# Add all required environment variables

# Set permissions
sudo chown -R www-data:www-data /var/www/hercircle-shield
```

### Step 4: Setup PM2 Process Manager

```bash
# Install PM2
sudo npm install -g pm2

# Start application
pm2 start dist/index.js --name hercircle-shield

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### Step 5: Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/hercircle-shield
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/socket.io {
        proxy_pass http://localhost:3000/api/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/hercircle-shield /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

### Step 7: Database Migration

```bash
cd /var/www/hercircle-shield
pnpm db:push
```

---

## Chrome Extension Deployment

### Step 1: Prepare Extension Package

```bash
# Navigate to extension directory
cd extension

# Remove development files
rm -rf node_modules .git

# Create ZIP package
zip -r hercircle-shield-extension.zip . -x "*.DS_Store" "*.git*"
```

### Step 2: Chrome Web Store Submission

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click "New Item"
3. Upload `hercircle-shield-extension.zip`
4. Fill in store listing details:
   - Name: HerCircle Shield
   - Description: Real-time GBV detection and support for women
   - Category: Social & Communication
   - Language: English
5. Upload screenshots (1280x800 or 640x400)
6. Upload promotional images:
   - Small tile: 440x280
   - Large tile: 920x680
   - Marquee: 1400x560
7. Set privacy policy URL
8. Submit for review

### Step 3: Update Backend URL

Before submission, update the API base URL in extension files:

```javascript
// extension/background/service-worker.js
const API_BASE_URL = 'https://your-production-domain.com/api/trpc';
```

---

## Post-Deployment Checklist

### Backend Verification

- [ ] API endpoints responding correctly
- [ ] Database connections working
- [ ] WebSocket connections established
- [ ] AI detection services functional
- [ ] SSL certificate valid
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Backup system configured

### Extension Verification

- [ ] Extension loads without errors
- [ ] Content detection working on all platforms
- [ ] Popup UI displays correctly
- [ ] Settings persist correctly
- [ ] Panic button sends alerts
- [ ] Evidence capture functional
- [ ] WebSocket chat working
- [ ] Icons display correctly
- [ ] Permissions granted

### Security Checks

- [ ] All secrets stored securely
- [ ] HTTPS enforced
- [ ] Database encrypted
- [ ] API authentication working
- [ ] Rate limiting tested
- [ ] Input validation active
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Security headers configured

---

## Monitoring & Maintenance

### Logging

Monitor application logs:

```bash
# Docker
docker-compose logs -f backend

# PM2
pm2 logs hercircle-shield

# Railway
railway logs

# Heroku
heroku logs --tail
```

### Performance Monitoring

Track key metrics:
- API response times
- Detection accuracy
- WebSocket connections
- Database query performance
- Error rates
- User engagement

### Backup Strategy

```bash
# Database backup
mysqldump -u user -p database > backup_$(date +%Y%m%d).sql

# Automated daily backups
0 2 * * * /usr/bin/mysqldump -u user -p database > /backups/backup_$(date +\%Y\%m\%d).sql
```

### Updates

```bash
# Pull latest code
git pull origin main

# Install dependencies
pnpm install

# Run migrations
pnpm db:push

# Build
pnpm build

# Restart services
pm2 restart hercircle-shield
# or
docker-compose restart
```

---

## Troubleshooting

### Common Issues

**Issue:** Database connection errors  
**Solution:** Verify DATABASE_URL format and credentials

**Issue:** WebSocket not connecting  
**Solution:** Check firewall rules and proxy configuration

**Issue:** AI detection not working  
**Solution:** Verify API keys are set correctly

**Issue:** High memory usage  
**Solution:** Increase server resources or optimize queries

### Support

For deployment support:
- Email: devops@hercircle.org
- Documentation: https://docs.hercircle.org
- GitHub Issues: https://github.com/hercircle/shield/issues

---

## Scaling Considerations

### Horizontal Scaling

- Use load balancer (Nginx, HAProxy)
- Deploy multiple backend instances
- Implement Redis for session storage
- Use database read replicas

### Performance Optimization

- Enable caching (Redis)
- Optimize database indexes
- Use CDN for static assets
- Implement API response caching
- Compress responses (gzip)

---

**Deployment complete! Your HerCircle Shield instance is now protecting users.**

*Made with 💗 for African women*

Version 1.0.0 | Last Updated: November 2025
