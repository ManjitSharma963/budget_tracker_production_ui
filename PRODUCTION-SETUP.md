# Production Setup Guide

This guide helps you configure the app for production deployment.

## Automatic API URL Detection

The app **automatically detects** the API URL based on where it's hosted:

- **Production (www.trackmyexpenses.in)**: Uses `https://www.trackmyexpenses.in/api`
- **Local Development**: Uses `http://localhost:8080/api`

## How It Works

1. **Environment Variable** (Highest Priority)
   - If `VITE_API_URL` is set, it uses that value
   - Set in `.env.production` or build-time environment

2. **Auto-Detection** (Default)
   - Checks `window.location.hostname`
   - If hostname is NOT `localhost` or `127.0.0.1`, uses same protocol and hostname
   - Example: If app is at `https://www.trackmyexpenses.in`, API URL becomes `https://www.trackmyexpenses.in/api`

3. **Localhost Fallback** (Development)
   - Only used when hostname is `localhost` or `127.0.0.1`
   - Defaults to `http://localhost:8080/api`

## Production Deployment

### Option 1: Auto-Detection (Recommended)

**No configuration needed!** The app automatically detects your production domain.

When deployed to `https://www.trackmyexpenses.in`:
- Frontend: `https://www.trackmyexpenses.in/`
- API: `https://www.trackmyexpenses.in/api` (auto-detected)

**Requirements:**
- Nginx/Apache must proxy `/api/*` to your backend server
- Backend should be running on `localhost:8080` (or configured port)
- SSL certificate configured for HTTPS

### Option 2: Explicit Environment Variable

If you need to override auto-detection, set `VITE_API_URL`:

**For Production Build:**
```bash
# Set environment variable during build
VITE_API_URL=https://www.trackmyexpenses.in/api npm run build
```

**Or create `.env.production`:**
```
VITE_API_URL=https://www.trackmyexpenses.in/api
```

## Nginx Configuration

Your Nginx should proxy `/api` requests to the backend:

```nginx
server {
    listen 443 ssl;
    server_name www.trackmyexpenses.in;

    # Frontend static files
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Build for Production

```bash
# Build with auto-detection (recommended)
npm run build

# Or build with explicit API URL
VITE_API_URL=https://www.trackmyexpenses.in/api npm run build
```

The built files will be in the `dist/` directory.

## Verification

After deployment, check the browser console (F12):
- In development: You'll see `🔗 API Base URL: http://localhost:8080/api`
- In production: The app will use `https://www.trackmyexpenses.in/api` automatically

## Troubleshooting

### API calls failing in production

1. **Check Nginx configuration**: Ensure `/api` is proxied to backend
2. **Check backend**: Ensure backend is running and accessible
3. **Check CORS**: Backend must allow requests from your domain
4. **Check SSL**: If frontend is HTTPS, API must also be HTTPS (or use proxy)

### Still using localhost in production

1. Clear browser cache
2. Rebuild the app: `npm run build`
3. Check that hostname is not `localhost` or `127.0.0.1`
4. Verify Nginx is serving the new build

## Current Configuration

The app is configured to:
- ✅ Auto-detect production domain
- ✅ Use HTTPS when page is HTTPS
- ✅ Use HTTP when page is HTTP
- ✅ Fall back to localhost only for development
- ✅ Support environment variable override

**No changes needed** - the app is production-ready!

