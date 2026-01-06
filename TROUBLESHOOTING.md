# Troubleshooting 403 Forbidden Error

## Issue
Getting `403 Forbidden` when trying to access `/api/auth/login` from `http://www.trackmyexpenses.in`

## Solutions

### Solution 1: Use Nginx Reverse Proxy (Recommended)

1. **Install Nginx** (if not already installed):
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Create Nginx Configuration**:
   - Copy `nginx.conf.example` to `/etc/nginx/sites-available/trackmyexpenses.in`
   - Update the frontend port if different from 5173
   - Update the backend port if different from 8080

3. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/trackmyexpenses.in /etc/nginx/sites-enabled/
   sudo nginx -t  # Test configuration
   sudo systemctl reload nginx
   ```

4. **Update Frontend**:
   - The frontend has been updated to use the same domain
   - It will now call `http://www.trackmyexpenses.in/api` instead of `http://www.trackmyexpenses.in:8080/api`
   - Rebuild your frontend: `npm run build`

5. **Start Services**:
   ```bash
   # Start backend
   cd backend
   npm start

   # Start frontend (if using dev server)
   npm run dev
   ```

### Solution 2: Direct Port Access (Alternative)

If you want to keep using port 8080 directly:

1. **Check Firewall**:
   ```bash
   sudo ufw status
   sudo ufw allow 8080/tcp
   ```

2. **Check if Backend is Running**:
   ```bash
   curl http://localhost:8080/api/health
   ```

3. **Check Backend Logs**:
   - Look for the login request in console
   - Should see: `🔐 Login request received from: ...`

4. **Test Direct Access**:
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

### Solution 3: Check for Other Reverse Proxies

If you're using Apache or another reverse proxy:

1. **Apache Configuration** (`.htaccess` or virtual host):
   ```apache
   <Location /api>
       ProxyPass http://localhost:8080/api
       ProxyPassReverse http://localhost:8080/api
       Header set Access-Control-Allow-Origin "*"
   </Location>
   ```

2. **Check for Cloudflare or CDN**:
   - If using Cloudflare, check firewall rules
   - May need to whitelist your API endpoints

## Debugging Steps

1. **Check Backend Logs**:
   ```bash
   # In backend directory
   npm start
   # Look for login requests in console
   ```

2. **Test with curl**:
   ```bash
   # From server
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"your@email.com","password":"yourpassword"}'
   ```

3. **Check Browser Network Tab**:
   - Open DevTools (F12)
   - Go to Network tab
   - Try login
   - Check the request/response headers
   - Look for CORS errors

4. **Check Server Access**:
   ```bash
   # Test if port 8080 is accessible
   netstat -tulpn | grep 8080
   ```

## Common Issues

1. **Port 8080 Blocked by Firewall**: Open port 8080
2. **Backend Not Running**: Start the backend server
3. **Wrong Port**: Check if backend is on different port
4. **Reverse Proxy Not Configured**: Set up nginx/apache
5. **CORS Issues**: Backend CORS is configured, but proxy might block it

## Quick Fix

If you just want to test quickly:

1. Revert frontend to use port 8080:
   ```javascript
   // In src/services/api.js and auth.js
   // Change back to: return `http://${host}:8080/api`;
   ```

2. Make sure backend is accessible on port 8080
3. Check firewall rules
4. Test with curl from server

