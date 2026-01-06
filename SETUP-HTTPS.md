# Setup Instructions for HTTPS (Priority)

## Step 1: Get SSL Certificate

### Option A: Let's Encrypt (Free, Recommended)

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get certificate (nginx must be running first)
sudo certbot --nginx -d www.trackmyexpenses.in -d trackmyexpenses.in

# Certbot will automatically configure nginx
```

### Option B: Self-Signed Certificate (For Testing Only)

```bash
# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/trackmyexpenses.key \
  -out /etc/nginx/ssl/trackmyexpenses.crt

# Update nginx config to use these paths
```

## Step 2: Copy Nginx Configuration

```bash
sudo cp nginx-https-priority.conf /etc/nginx/sites-available/trackmyexpenses.in
```

## Step 3: Update Configuration

Edit the configuration file:

```bash
sudo nano /etc/nginx/sites-available/trackmyexpenses.in
```

**Update these settings:**

1. **SSL Certificate Paths** (if not using Let's Encrypt):
   ```nginx
   ssl_certificate /etc/nginx/ssl/trackmyexpenses.crt;
   ssl_certificate_key /etc/nginx/ssl/trackmyexpenses.key;
   ```

2. **Frontend Port**:
   ```nginx
   proxy_pass http://localhost:5173;  # Change to your frontend port
   ```

3. **If serving built files** (instead of dev server):
   ```nginx
   # Comment out proxy_pass
   # proxy_pass http://localhost:5173;
   
   # Uncomment and update:
   root /path/to/your/build;
   try_files $uri $uri/ /index.html;
   ```

## Step 4: Enable the Site

```bash
# Create symlink to enable the site
sudo ln -s /etc/nginx/sites-available/trackmyexpenses.in /etc/nginx/sites-enabled/

# Remove default nginx site if it conflicts
sudo rm /etc/nginx/sites-enabled/default
```

## Step 5: Test Nginx Configuration

```bash
# Test the configuration for syntax errors
sudo nginx -t
```

If you see "syntax is ok" and "test is successful", proceed.

## Step 6: Reload Nginx

```bash
sudo systemctl reload nginx
```

Or restart if reload doesn't work:
```bash
sudo systemctl restart nginx
```

## Step 7: Rebuild Frontend (IMPORTANT!)

**This is critical - the frontend must be rebuilt with the new code:**

```bash
# In your project root directory
npm run build

# If using dev server, restart it
npm run dev
```

## Step 8: Clear Browser Cache

**Very Important!** Clear your browser cache or do a hard refresh:

- **Chrome/Edge**: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- **Firefox**: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
- Or open DevTools (F12) → Network tab → Check "Disable cache"

## Step 9: Start Backend Server

Make sure your backend is running:

```bash
# In backend directory
cd backend
npm start
```

## Step 10: Test

1. **Test HTTPS redirect:**
   - Visit: `http://www.trackmyexpenses.in`
   - Should automatically redirect to: `https://www.trackmyexpenses.in`

2. **Test API:**
   ```bash
   curl https://www.trackmyexpenses.in/api/health
   ```
   Should return: `{"status":"UP","message":"API is running"}`

3. **Test in browser:**
   - Open: `https://www.trackmyexpenses.in`
   - Open DevTools (F12) → Console
   - Should see: `🔗 API Base URL: https://www.trackmyexpenses.in/api`
   - Try to login
   - Check Network tab - API calls should be to `https://www.trackmyexpenses.in/api/auth/login` (NOT port 8080, NOT HTTP)

4. **Check logs:**
   ```bash
   # Nginx access logs
   sudo tail -f /var/log/nginx/trackmyexpenses-access.log
   
   # Nginx error logs
   sudo tail -f /var/log/nginx/trackmyexpenses-error.log
   
   # Backend logs (in backend terminal)
   # Should see: 🔐 Login request received from: https://www.trackmyexpenses.in
   ```

## Troubleshooting

### Still seeing port 8080 in API calls?

1. **Clear browser cache completely:**
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   - Or use Incognito/Private mode

2. **Verify frontend is rebuilt:**
   ```bash
   # Check build timestamp
   ls -la dist/
   ```

3. **Check browser console:**
   - Open DevTools (F12) → Console
   - Look for: `🔗 API Base URL: ...`
   - Should show: `https://www.trackmyexpenses.in/api`

### Mixed Content Error?

- Make sure you're accessing via HTTPS: `https://www.trackmyexpenses.in`
- Check browser console for the actual API URL being called
- Verify nginx is properly configured and running

### SSL Certificate Issues?

- If using Let's Encrypt, check: `sudo certbot certificates`
- If using self-signed, browsers will show a warning (click "Advanced" → "Proceed")

### 502 Bad Gateway?

- Check if backend is running: `curl http://localhost:8080/api/health`
- Check if frontend is running: `curl http://localhost:5173`
- Check nginx error logs: `sudo tail -f /var/log/nginx/trackmyexpenses-error.log`

## Verify Everything Works

✅ HTTP redirects to HTTPS  
✅ Frontend loads at `https://www.trackmyexpenses.in`  
✅ API calls go to `https://www.trackmyexpenses.in/api/*` (no port 8080, HTTPS)  
✅ Login works without mixed content errors  
✅ Backend logs show HTTPS requests  

## Auto-Renewal for Let's Encrypt

Let's Encrypt certificates expire every 90 days. Set up auto-renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot usually sets up auto-renewal automatically
# Check with:
sudo systemctl status certbot.timer
```

