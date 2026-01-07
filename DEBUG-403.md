# Debugging 403 Forbidden Error

## The Issue

You're getting `403 Forbidden` when trying to login via the browser, but `curl` works fine. This suggests:

1. ✅ Backend is working (curl proves it)
2. ✅ Frontend is using correct URL (HTTPS, no port 8080)
3. ❌ Something is blocking the browser request

## Possible Causes

### 1. Nginx Proxy Configuration Issue

The nginx proxy might not be forwarding the request correctly, or there's a firewall/security rule blocking it.

**Check nginx logs:**
```bash
sudo tail -f /var/log/nginx/trackmyexpenses-error.log
sudo tail -f /var/log/nginx/trackmyexpenses-access.log
```

**Test if nginx is receiving the request:**
- Check access logs when you try to login
- Should see: `POST /api/auth/login HTTP/1.1`

### 2. Backend Not Receiving Request

The backend might not be receiving the request at all.

**Check backend logs:**
- When you try to login, you should see: `🔐 Login request received from: ...`
- If you don't see this, nginx isn't forwarding the request

### 3. Proxy Headers Issue

Nginx might not be forwarding headers correctly.

**Check nginx config:**
```nginx
location /api {
    proxy_pass http://localhost:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;  # Important for HTTPS
}
```

### 4. Backend Server Not Running

The backend might not be running or not accessible.

**Test:**
```bash
curl http://localhost:8080/api/health
```

Should return: `{"status":"UP","message":"API is running"}`

## Debugging Steps

### Step 1: Check Backend Logs

When you try to login, check your backend console. You should see:
```
🔐 Login request received from: https://www.trackmyexpenses.in
📧 Email: provided
```

**If you DON'T see this:**
- Nginx is not forwarding the request
- Check nginx error logs
- Verify nginx config

**If you DO see this but still get 403:**
- Backend is receiving request but rejecting it
- Check backend code for any middleware blocking it

### Step 2: Check Nginx Logs

```bash
# Error logs
sudo tail -f /var/log/nginx/trackmyexpenses-error.log

# Access logs
sudo tail -f /var/log/nginx/trackmyexpenses-access.log
```

Look for:
- 403 errors
- Missing proxy_pass directives
- Connection refused errors

### Step 3: Test Direct Backend Access

```bash
# From the server
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

If this works but browser doesn't, it's an nginx issue.

### Step 4: Test Through Nginx

```bash
# From the server
curl -X POST https://www.trackmyexpenses.in/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

If this works, the issue is browser-specific (CORS, cookies, etc.)

### Step 5: Check Browser Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Try to login
4. Click on the failed request
5. Check:
   - **Request URL**: Should be `https://www.trackmyexpenses.in/api/auth/login`
   - **Request Method**: Should be `POST`
   - **Status Code**: 403
   - **Response Headers**: Check for error messages
   - **Request Headers**: Check if all headers are present

## Common Fixes

### Fix 1: Update Nginx Config

Make sure your nginx config has proper proxy settings:

```nginx
location /api {
    proxy_pass http://localhost:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    
    # Don't forget CORS headers
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin' always;
    
    # Handle OPTIONS
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

### Fix 2: Restart Services

```bash
# Restart nginx
sudo systemctl restart nginx

# Restart backend (if using PM2 or similar)
# Or just restart the node process
```

### Fix 3: Check Firewall

```bash
# Check if port 8080 is accessible
sudo netstat -tulpn | grep 8080

# Check firewall rules
sudo ufw status
```

## Quick Test

Run this from your server to see what's happening:

```bash
# Test 1: Backend directly
curl -v http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test 2: Through nginx
curl -v https://www.trackmyexpenses.in/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

Compare the responses. This will tell you where the issue is.

