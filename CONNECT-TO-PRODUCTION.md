# Connect Local Frontend to Production API

## Quick Setup

### Option 1: Create .env.local file (Recommended)

1. **Create `.env.local` file** in the project root:
   ```bash
   # In project root directory
   echo VITE_API_URL=https://www.trackmyexpenses.in/api > .env.local
   ```

2. **Or manually create the file** with this content:
   ```
   VITE_API_URL=https://www.trackmyexpenses.in/api
   ```

3. **Restart the dev server**:
   ```bash
   # Stop the current dev server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

### Option 2: Use Command Line

Set the environment variable when starting the dev server:

**Windows (PowerShell):**
```powershell
$env:VITE_API_URL="https://www.trackmyexpenses.in/api"; npm run dev
```

**Windows (CMD):**
```cmd
set VITE_API_URL=https://www.trackmyexpenses.in/api && npm run dev
```

**Mac/Linux:**
```bash
VITE_API_URL=https://www.trackmyexpenses.in/api npm run dev
```

## Verify It's Working

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12) → Console tab
   - Should see: `🔗 API Base URL: https://www.trackmyexpenses.in/api`

3. **Open Network tab** (F12) → Network
   - Try to login
   - API calls should go to: `https://www.trackmyexpenses.in/api/auth/login`

4. **Test the connection**:
   - Open: `http://localhost:5173`
   - Try to login
   - Should connect to production API

## Switch Back to Local Backend

To use local backend again:

1. **Remove or comment out** the line in `.env.local`:
   ```
   # VITE_API_URL=https://www.trackmyexpenses.in/api
   ```

2. **Or delete** `.env.local` file

3. **Restart dev server**

## Important Notes

- ✅ Frontend runs locally: `http://localhost:5173`
- ✅ API calls go to: `https://www.trackmyexpenses.in/api`
- ⚠️ You need to be logged in to production to test
- ⚠️ CORS must be configured on production server
- ⚠️ Any data changes will affect production database

## Troubleshooting

### CORS Errors?

Make sure production backend has CORS configured to allow `http://localhost:5173`

### Still Using Localhost?

1. Check `.env.local` file exists and has correct value
2. Restart dev server (environment variables are loaded at startup)
3. Check browser console for the API URL being used

### Environment Variable Not Working?

1. Make sure file is named exactly `.env.local` (not `.env.local.txt`)
2. Make sure it's in the project root (same level as `package.json`)
3. Restart the dev server after creating/modifying the file

