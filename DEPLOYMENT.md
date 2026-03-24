# 🚀 Deployment Guide

## Backend Deployment

### Option 1: Render (Recommended)

1. **Connect GitHub repo** to Render
2. **Create Web Service**:
   - Environment: Node
   - Build Command: `npm ci`
   - Start Command: `node server.js`

3. **Set Environment Variables**:
   ```
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   PORT=10000
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

4. **Enable custom domain** if needed

### Option 2: Railway

1. **Connect GitHub** to Railway
2. **Create variables** in railway.json or dashboard
3. **Deploy** - Railway auto-detects Node.js apps

### Option 3: Docker

```dockerfile
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5001
CMD ["node", "server.js"]
```

Push to Docker Hub, deploy to any platform (AWS, GCP, Azure).

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Connect GitHub** to Vercel
2. **Framework Preset**: Vite
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

5. **Set Environment Variables**:
   ```
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   VITE_API_URL=https://your-backend.render.com/api
   VITE_GOOGLE_CLIENT_ID=your_client_id
   ```

6. **Deploy** - Auto-deploys on git push

### Option 2: Netlify

```bash
# Build locally first
npm run build

# Deploy using Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

Or connect GitHub repo directly.

### Option 3: GitHub Pages / Static Hosting

```bash
# Build
npm run build

# Upload dist/ folder to:
# - GitHub Pages
# - AWS S3 + CloudFront
# - Azure Static Web Apps
# - Google Cloud Storage
```

## Database Deployment

### Supabase (Already Hosted)

1. Your Supabase project is live at `https://your-project.supabase.co`
2. Database is automatically managed
3. Storage buckets are configured

### Production Checklist

- [ ] Enable RLS on all tables
- [ ] Set storage bucket access to public (stickers)
- [ ] Configure CORS if backend on different domain
- [ ] Enable email confirmations (optional)
- [ ] Backup database regularly

## Google OAuth Production

1. **Update OAuth Credentials**:
   - Add production domain to authorized origins
   - Update redirect URIs to production URLs

2. **Settings**:
   ```
   Authorized JavaScript origins:
   - https://your-frontend.com
   
   Authorized redirect URIs:
   - https://your-frontend.com/callback
   ```

## Monitoring & Monitoring

### Backend Monitoring

Add error logging (e.g., Sentry):

```javascript
import Sentry from "@sentry/node";

Sentry.init({ 
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV 
});
```

### Frontend Monitoring

Add error tracking:

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({ 
  dsn: process.env.REACT_APP_SENTRY_DSN 
});
```

### Supabase Logs

Monitor via Supabase dashboard:
- Database logs
- Auth events
- Storage access

## Performance Optimization

### Backend
- Enable gzip compression
- Cache FFmpeg binary
- Implement request queuing
- Monitor memory usage

### Frontend
- Enable brotli compression
- Lazy load routes
- Optimize images with next-gen formats
- Use service workers for caching

## Scaling Strategy

### Phase 1 (Starting)
- Single backend instance
- Supabase free tier
- Basic CDN (Vercel/Netlify)

### Phase 2 (Growth)
- Load balancer for backend
- Supabase Pro (more connections)
- global CDN for assets
- Redis cache layer

### Phase 3 (Scale)
- Kubernetes for backend
- Database read replicas
- S3 + CloudFront for media
- Message queue for processing

## Cost Estimation (Monthly)

| Service | Free Tier | Pro |
|---------|-----------|-----|
| Supabase | $0 | $25+ |
| Render Backend | $0.19/hour (free tier) | $7+ |
| Vercel Frontend | $0 | $20+ |
| Bandwidth | Included | Paid |
| **Total** | ~$5-10 | $100+/month |

## Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS everywhere
- [ ] RLS policies enforced
- [ ] Rate limiting enabled
- [ ] Input validation
- [ ] CORS properly configured
- [ ] No secrets in git
- [ ] Regular backups enabled
- [ ] Monitoring alerts set up

---

## Quick Deploy Commands

### Render Backend
```bash
git push origin main  # Auto-deploys to render
```

### Vercel Frontend
```bash
git push origin main  # Auto-deploys to vercel
```

### Self-Hosted (Docker)
```bash
docker build -t talking-stickers .
docker push your-registry/talking-stickers
# Deploy via Docker Compose or Kubernetes
```

---

Questions? Check the main [README.md](./README.md)
