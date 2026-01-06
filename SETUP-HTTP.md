# Setup Instructions for HTTP Only

## Step 1: Copy Nginx Configuration

```bash
sudo cp nginx-http-only.conf /etc/nginx/sites-available/trackmyexpenses.in
```

## Step 2: Update Configuration (if needed)

Edit the configuration file to match your setup:

```bash
sudo nano /etc/nginx/sites-available/trackmyexpenses.in
```

**Important settings to check:**
- **Frontend port**: Change `proxy_pass http://localhost:5173;` if your frontend runs on a different port
- **Backend port**: The config assumes backend is on `localhost:8080` (this should be correct)

**If serving built files instead of dev server:**
- Comment out the `proxy_pass` line
- Uncomment and update the `root` and `try_files` lines:
  ```nginx
  root /path/to/your/build;
  try_files $uri $uri/ /index.html;
  ```

## Step 3: Enable the Site

```bash
# Create symlink to enable the site
sudo ln -s /etc/nginx/sites-available/trackmyexpenses.in /etc/nginx/sites-enabled/

# Remove default nginx site if it conflicts
sudo rm /etc/nginx/sites-enabled/default
```

## Step 4: Test Nginx Configuration

```bash
# Test the configuration for syntax errors
sudo nginx -t
```

If you see "syntax is ok" and "test is successful", proceed to next step.

## Step 5: Reload Nginx

```bash
sudo systemctl reload nginx
```

Or restart if reload doesn't work:
```bash
sudo systemctl restart nginx
```

## Step 6: Rebuild Frontend

Make sure your frontend is rebuilt with the latest code:

```bash
# In your project root directory
npm run build

# Or if using dev server
npm run dev
```

## Step 7: Start Backend Server

Make sure your backend is running:

```bash
# In backend directory
cd backend
npm start
```

## Step 8: Test

1. **Test API directly:**
   ```bash
   curl http://www.trackmyexpenses.in/api/health
   ```
   Should return: `{"status":"UP","message":"API is running"}`

2. **Test in browser:**
   - Open: `http://www.trackmyexpenses.in`
   - Try to login
   - Check browser console (F12) - should see API calls to `http://www.trackmyexpenses.in/api/auth/login` (NOT port 8080)

3. **Check logs:**
   ```bash
   # Nginx access logs
   sudo tail -f /var/log/nginx/trackmyexpenses-access.log
   
   # Nginx error logs
   sudo tail -f /var/log/nginx/trackmyexpenses-error.log
   
   # Backend logs (in backend terminal)
   # Should see: 🔐 Login request received from: ...
   ```

## Troubleshooting

### If you get 502 Bad Gateway:
- Check if backend is running: `curl http://localhost:8080/api/health`
- Check if frontend is running: `curl http://localhost:5173`

### If you get 404 Not Found:
- Check nginx configuration: `sudo nginx -t`
- Check if site is enabled: `ls -la /etc/nginx/sites-enabled/`

### If API calls still use port 8080:
- Clear browser cache (Ctrl+Shift+R)
- Rebuild frontend: `npm run build`
- Check browser console to see actual API URL being called

### If CORS errors persist:
- Check backend logs for OPTIONS requests
- Verify backend CORS configuration in `backend/server.js`
- Check nginx CORS headers in the config file

## Verify Everything Works

1. ✅ Frontend loads at `http://www.trackmyexpenses.in`
2. ✅ API calls go to `http://www.trackmyexpenses.in/api/*` (no port 8080)
3. ✅ Login works without CORS errors
4. ✅ Backend logs show requests coming through

## Next Steps (Optional - Add HTTPS Later)

When you're ready to add HTTPS:
1. Get SSL certificate: `sudo certbot --nginx -d www.trackmyexpenses.in`
2. Update nginx config to use `nginx-https-trackmyexpenses.conf`
3. The frontend code will automatically use HTTPS when the page is HTTPS

