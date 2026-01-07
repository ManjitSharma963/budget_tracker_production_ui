# Docker Build Fix for Terser Error

## The Problem

Docker build is failing because it's using an old version of `vite.config.js` that references `terser`. The config has been updated to use `esbuild` instead.

## Solution 1: Commit and Push Changes (Recommended)

If Docker is building from a Git repository:

1. **Commit the updated vite.config.js:**
   ```bash
   git add vite.config.js
   git commit -m "Fix: Use esbuild instead of terser for production build"
   git push
   ```

2. **Rebuild Docker without cache:**
   ```bash
   docker-compose build --no-cache budget_tracker_production_ui
   ```

## Solution 2: Rebuild Without Cache

If you've already committed the changes:

```bash
# Rebuild the UI service without cache
docker-compose build --no-cache budget_tracker_production_ui

# Or rebuild all services
docker-compose build --no-cache
```

## Solution 3: Verify vite.config.js in Docker

Check if the Dockerfile is copying the correct file:

1. **Check your Dockerfile** - make sure it's copying `vite.config.js`:
   ```dockerfile
   COPY vite.config.js ./
   ```

2. **Or copy entire project:**
   ```dockerfile
   COPY . .
   ```

## Solution 4: Add Terser as Dependency (Alternative)

If you prefer to keep using terser, add it to package.json:

```json
{
  "devDependencies": {
    "terser": "^5.24.0"
  }
}
```

Then run `npm install` before building.

## Current Configuration (Recommended)

The `vite.config.js` is now configured to use `esbuild` (built-in, no extra dependency):

```javascript
build: {
  minify: 'esbuild', // Uses built-in esbuild
  esbuild: {
    drop: ['console', 'debugger'],
  },
}
```

## Quick Fix Steps

1. **Verify vite.config.js is updated** (should use `esbuild`, not `terser`)
2. **Commit and push changes** to your Git repository
3. **Rebuild Docker:**
   ```bash
   docker-compose build --no-cache budget_tracker_production_ui
   docker-compose up -d
   ```

## Verify the Fix

After rebuilding, check the build logs. You should see:
- ✅ No terser errors
- ✅ Build completes successfully
- ✅ Uses esbuild for minification

