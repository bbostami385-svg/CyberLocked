# CyberLocked - Deployment Guide

This guide provides step-by-step instructions for deploying CyberLocked to Render, Vercel, and Firebase.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Render Deployment](#render-deployment)
3. [Vercel Deployment](#vercel-deployment)
4. [Firebase Deployment](#firebase-deployment)
5. [GitHub Actions CI/CD](#github-actions-cicd)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before deploying, ensure you have:

- Git repository with CyberLocked code
- Node.js 22.x installed locally
- pnpm package manager
- Accounts on:
  - Render (https://render.com)
  - Vercel (https://vercel.com)
  - Firebase (https://firebase.google.com)
  - GitHub (https://github.com)

---

## Render Deployment

### Step 1: Create Render Account

1. Go to https://render.com and sign up
2. Connect your GitHub account
3. Authorize Render to access your repositories

### Step 2: Create Web Service

1. Click "New +" → "Web Service"
2. Select your CyberLocked repository
3. Configure settings:
   - **Name**: `cyberlocked-api`
   - **Environment**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Plan**: Standard ($12/month)

### Step 3: Add Environment Variables

In Render Dashboard:

1. Go to Service → Environment
2. Add all required variables:

```
NODE_ENV=production
DATABASE_URL=your_mysql_connection_string
JWT_SECRET=generate_a_strong_secret
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Your Name
BUILT_IN_FORGE_API_URL=your_forge_api_url
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_URL=your_frontend_forge_url
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_key
```

### Step 4: Create Database

1. Click "New +" → "PostgreSQL" or "MySQL"
2. Configure database:
   - **Name**: `cyberlocked-db`
   - **Plan**: Standard ($15/month)
3. Copy connection string to `DATABASE_URL`

### Step 5: Deploy

1. Click "Deploy"
2. Monitor deployment logs
3. Your app will be available at `https://cyberlocked-api.onrender.com`

---

## Vercel Deployment

### Step 1: Create Vercel Account

1. Go to https://vercel.com and sign up
2. Import your GitHub repository
3. Select CyberLocked project

### Step 2: Configure Project

1. **Project Name**: `cyberlocked`
2. **Framework**: Other
3. **Build Command**: `pnpm build`
4. **Output Directory**: `dist`
5. **Install Command**: `pnpm install`

### Step 3: Add Environment Variables

In Vercel Dashboard:

1. Go to Settings → Environment Variables
2. Add all required variables (same as Render)

### Step 4: Configure Database

For Vercel, use:
- **Option 1**: Vercel Postgres (recommended)
- **Option 2**: External MySQL database

If using Vercel Postgres:

```bash
# Install Vercel CLI
npm i -g vercel

# Create database
vercel postgres create cyberlocked

# Copy connection string
```

### Step 5: Deploy

1. Click "Deploy"
2. Vercel will automatically deploy on every push to main branch
3. Your app will be available at `https://cyberlocked.vercel.app`

### Step 6: Custom Domain

1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

---

## Firebase Deployment

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Create Project"
3. Name: `cyberlocked`
4. Enable Google Analytics (optional)

### Step 2: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init
```

### Step 3: Configure Firebase

1. Select features:
   - ✅ Hosting
   - ✅ Functions
   - ✅ Firestore
   - ✅ Storage

2. Choose existing project: `cyberlocked`

3. Configure hosting:
   - Public directory: `client/dist`
   - Single-page app: Yes
   - Automatic builds: Yes

### Step 4: Set Environment Variables

Create `.env.local`:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=cyberlocked.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cyberlocked
VITE_FIREBASE_STORAGE_BUCKET=cyberlocked.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 5: Deploy

```bash
# Build project
pnpm build

# Deploy to Firebase
firebase deploy
```

Your app will be available at `https://cyberlocked.firebaseapp.com`

---

## GitHub Actions CI/CD

### Step 1: Add Secrets to GitHub

1. Go to Repository → Settings → Secrets and Variables → Actions
2. Add the following secrets:

```
RENDER_SERVICE_ID=your_render_service_id
RENDER_API_KEY=your_render_api_key
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json
FIREBASE_PROJECT_ID=cyberlocked
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

### Step 2: Workflow Triggers

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:

1. **On Pull Request**: Run tests and build
2. **On Push to main**: Deploy to Render and Vercel
3. **On Push to production**: Deploy to Firebase

### Step 3: Monitor Deployments

1. Go to Repository → Actions
2. View workflow runs and logs
3. Check deployment status

---

## Environment Variables

### Required Variables

```
NODE_ENV=production
DATABASE_URL=mysql://user:password@host:3306/cyberlocked
JWT_SECRET=generate_with_openssl_rand_-_hex_32
```

### Manus Integration

```
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Your Name
BUILT_IN_FORGE_API_URL=your_forge_api_url
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_URL=your_frontend_forge_url
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_key
```

### Generate JWT Secret

```bash
openssl rand -hex 32
```

---

## Database Setup

### MySQL/TiDB Setup

1. Create database:

```sql
CREATE DATABASE cyberlocked;
CREATE USER 'cyberlocked_user'@'%' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON cyberlocked.* TO 'cyberlocked_user'@'%';
FLUSH PRIVILEGES;
```

2. Run migrations:

```bash
pnpm drizzle-kit migrate
```

3. Verify tables:

```sql
SHOW TABLES;
```

### Backup Strategy

1. **Daily Backups**: Enable automated backups on your database provider
2. **Point-in-Time Recovery**: Configure PITR (if available)
3. **Backup Retention**: Keep 30 days of backups

---

## Monitoring & Maintenance

### Health Checks

1. **Render**: Automatic health checks at `/api/health`
2. **Vercel**: Monitor at https://vercel.com/dashboard
3. **Firebase**: Monitor at Firebase Console

### Logging

1. **Render**: View logs in Service dashboard
2. **Vercel**: View logs in Deployments
3. **Firebase**: View logs in Cloud Logging

### Performance Monitoring

1. Set up error tracking with Sentry
2. Monitor database performance
3. Track API response times

### Scaling

1. **Render**: Upgrade plan or enable auto-scaling
2. **Vercel**: Automatic scaling included
3. **Firebase**: Automatic scaling for Functions

---

## Troubleshooting

### Build Failures

1. Check Node.js version: `node --version` (should be 22.x)
2. Clear cache: `pnpm store prune`
3. Reinstall dependencies: `pnpm install --force`

### Database Connection Issues

1. Verify connection string format
2. Check firewall rules
3. Ensure database is running
4. Test connection locally: `mysql -u user -p -h host`

### Deployment Timeouts

1. Increase timeout limits in platform settings
2. Optimize build process
3. Check for large dependencies

### Environment Variable Issues

1. Verify all required variables are set
2. Check for typos in variable names
3. Ensure values are properly escaped

---

## Rollback Procedures

### Render Rollback

1. Go to Service → Deployments
2. Click "Redeploy" on previous version
3. Monitor deployment logs

### Vercel Rollback

1. Go to Deployments
2. Click "Promote to Production" on previous version

### Firebase Rollback

```bash
firebase hosting:rollback
```

---

## Security Best Practices

1. **Secrets Management**: Never commit secrets to Git
2. **HTTPS**: Ensure all deployments use HTTPS
3. **CORS**: Configure CORS properly for your domains
4. **Rate Limiting**: Implement rate limiting on APIs
5. **Database Security**: Use strong passwords and enable SSL
6. **Monitoring**: Set up alerts for suspicious activity

---

## Support

For deployment issues:

1. Check platform documentation
2. Review deployment logs
3. Contact platform support
4. Open GitHub issue with details

---

**Last Updated**: May 25, 2026  
**Version**: 1.0.0
