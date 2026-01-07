# Production Deployment Guide

## Prerequisites

- Node.js installed on production server
- Nginx installed and configured
- Backend server running on port 8080
- Domain configured (www.trackmyexpenses.in)

## Step 1: Build for Production

On your local machine or CI/CD:

```bash
# Install dependencies (if not already done)
npm install

# Build for production
npm run build
```

This creates an optimized production build in the `dist/` folder.

## Step 2: Upload to Production Server

Upload the `dist/` folder contents to your production server:

```bash
# Using SCP
scp -r dist/* user@your-server:/var/www/trackmyexpenses.in/

# Or using rsync
rsync -avz dist/ user@your-server:/var/www/trackmyexpenses.in/
```

## Step 3: Configure Nginx

Update your nginx configuration to serve the static files:

```nginx
server {
    listen 80;
    server_name www.trackmyexpenses.in trackmyexpenses.in;
    return 301 https://www.trackmyexpenses.in$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.trackmyexpenses.in trackmyexpenses.in;

    # SSL Certificate
    ssl_certificate /etc/letsencrypt/live/www.trackmyexpenses.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.trackmyexpenses.in/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Root directory for static files
    root /var/www/trackmyexpenses.in;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API - proxy to Node.js
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        # Handle OPTIONS
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Logging
    access_log /var/log/nginx/trackmyexpenses-access.log;
    error_log /var/log/nginx/trackmyexpenses-error.log;
}
```

## Step 4: Set Permissions

```bash
# Set proper permissions
sudo chown -R www-data:www-data /var/www/trackmyexpenses.in
sudo chmod -R 755 /var/www/trackmyexpenses.in
```

## Step 5: Reload Nginx

```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Step 6: Verify Deployment

1. **Check website**: `https://www.trackmyexpenses.in`
2. **Check API**: `https://www.trackmyexpenses.in/api/health`
3. **Test login**: Try logging in
4. **Check browser console**: No errors, API calls go to `/api` (no port 8080)

## Production Optimizations

### Build Optimizations (Already Configured)

- ✅ Minification enabled
- ✅ Console logs removed in production
- ✅ Code splitting (React and Recharts in separate chunks)
- ✅ Source maps disabled
- ✅ Terser minification

### Nginx Optimizations

- ✅ Static asset caching (1 year)
- ✅ Gzip compression (if enabled)
- ✅ HTTPS with modern TLS
- ✅ Security headers

## Environment Variables

For production, you don't need any environment variables. The app automatically detects:
- Protocol (HTTP/HTTPS)
- Domain name
- Uses `/api` path (proxied by nginx)

## Updating Production

When you need to update:

```bash
# 1. Build new version locally
npm run build

# 2. Upload to server
scp -r dist/* user@server:/var/www/trackmyexpenses.in/

# 3. Reload nginx (optional, usually not needed)
sudo systemctl reload nginx
```

## Troubleshooting

### 404 Errors on Refresh

Make sure nginx has:
```nginx
try_files $uri $uri/ /index.html;
```

### API Calls Fail

1. Check backend is running: `curl http://localhost:8080/api/health`
2. Check nginx proxy config
3. Check CORS headers in nginx

### Static Files Not Loading

1. Check file permissions
2. Check nginx root directory path
3. Check nginx error logs: `sudo tail -f /var/log/nginx/trackmyexpenses-error.log`

## Monitoring

- **Nginx logs**: `/var/log/nginx/trackmyexpenses-access.log`
- **Backend logs**: Check backend console output
- **Browser console**: Check for JavaScript errors

## Security Checklist

- ✅ HTTPS enabled
- ✅ SSL certificate valid
- ✅ Security headers configured
- ✅ CORS properly configured
- ✅ No sensitive data in frontend code
- ✅ API requires authentication

