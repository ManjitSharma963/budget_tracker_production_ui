# Local Testing Guide

## Quick Start

### Step 1: Start Backend Server

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Start the backend server
npm start
```

The backend will run on `http://localhost:8080`

**Verify it's running:**
```bash
curl http://localhost:8080/api/health
```

Should return: `{"status":"UP","message":"API is running"}`

### Step 2: Start Frontend Dev Server

```bash
# In the project root directory
npm install  # If not already done

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

### Step 3: Access the Application

Open your browser and go to:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8080/api`

## How It Works Locally

When you access the app from `localhost` or `127.0.0.1`:
- The frontend automatically uses: `http://localhost:8080/api`
- No nginx needed
- Direct connection to backend

## Testing Login Locally

1. **Start both servers** (backend and frontend)
2. **Open browser**: `http://localhost:5173`
3. **Try to login** with your credentials
4. **Check backend console** - should see:
   ```
   🔐 Login request received from: http://localhost:5173
   📧 Email: provided
   ```

## Environment Variables (Optional)

If you want to customize the API URL, create a `.env.local` file:

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and set your API URL
VITE_API_URL=http://localhost:8080/api
```

## Troubleshooting

### Backend Not Starting?

```bash
# Check if port 8080 is already in use
netstat -ano | findstr :8080  # Windows
lsof -i :8080  # Mac/Linux

# Kill the process if needed, or change port in backend/server.js
```

### Frontend Not Starting?

```bash
# Check if port 5173 is already in use
netstat -ano | findstr :5173  # Windows
lsof -i :5173  # Mac/Linux

# Vite will automatically use the next available port
```

### CORS Errors?

The backend is configured to allow localhost. If you still get CORS errors:
- Make sure backend is running
- Check backend console for CORS logs
- Verify you're accessing from `localhost`, not `127.0.0.1` (or vice versa)

### API Calls Failing?

1. **Check backend is running**: `curl http://localhost:8080/api/health`
2. **Check browser console** (F12) for errors
3. **Check Network tab** - see what URL is being called
4. **Check backend logs** - should see request logs

## Testing Different Scenarios

### Test with Different Port

If your backend runs on a different port:

1. Update `.env.local`:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

2. Or update `backend/server.js`:
   ```javascript
   const PORT = process.env.PORT || 3000;
   ```

### Test Production Build Locally

```bash
# Build the frontend
npm run build

# Preview the build
npm run preview
```

This will serve the production build locally.

## Quick Commands

```bash
# Start backend (in backend directory)
cd backend && npm start

# Start frontend (in project root)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Default Ports

- **Frontend Dev Server**: `http://localhost:5173`
- **Backend API**: `http://localhost:8080`
- **Frontend Preview**: `http://localhost:4173` (when using `npm run preview`)

## Next Steps

Once local testing works:
1. Test all features (login, register, add expenses, etc.)
2. Check browser console for any errors
3. Verify backend logs show all requests
4. Test on different browsers

