# Deployment Guide for Socket.IO with Vercel

## Problem
Vercel is a serverless platform and **does not support persistent WebSocket connections** required by Socket.IO. This means Socket.IO cannot run directly on Vercel.

## Solution: Separate Socket.IO Server

A standalone Socket.IO server has been created in the `socket-server/` directory. You need to deploy this separately on a platform that supports WebSockets.

### Quick Start (Recommended: Railway)

1. **Deploy the Socket.IO Server:**
   - Go to [Railway](https://railway.app) and sign up
   - Click "New Project" → "Deploy from GitHub repo"
   - Select the `socket-server` folder (or create a new repo with just that folder)
   - Railway will auto-detect and deploy
   - Copy the deployment URL (e.g., `https://your-app.railway.app`)

2. **Configure Vercel:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add: `NUXT_PUBLIC_SOCKET_URL` = `https://your-app.railway.app`
   - Redeploy your Vercel app

3. **Test:**
   - Your app should now connect to the separate Socket.IO server
   - Check browser console - you should see successful WebSocket connections

### Alternative Platforms

#### Render
1. Go to [Render](https://render.com)
2. New → Web Service
3. Connect repo, set Root Directory to `socket-server`
4. Start Command: `node index.js`
5. Deploy and use the URL in Vercel env vars

#### Fly.io
1. Install: `npm install -g flyctl`
2. In `socket-server/` folder: `fly launch`
3. Deploy: `fly deploy`
4. Use the URL in Vercel env vars

#### Your GCP VM
1. Upload `socket-server/` folder to your VM
2. Run `npm install` and `npm start`
3. Set up reverse proxy if needed
4. Use your VM URL in Vercel env vars

### Environment Variables

**In Vercel:**
```
NUXT_PUBLIC_SOCKET_URL=https://your-socket-server.com
```

**In Socket.IO Server (optional):**
```
PORT=3001  # Defaults to 3001 if not set
```

### Testing Locally

1. Start the Socket.IO server:
   ```bash
   cd socket-server
   npm install
   npm start
   ```

2. Set local environment variable:
   ```bash
   # In your .env file or Vercel local dev
   NUXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

3. Start your Nuxt app and test the connection

### Important Notes

- The Socket.IO server is stateless - rooms reset on server restart
- CORS is configured to allow all origins (you may want to restrict this in production)
- The client code has been updated to use `useRuntimeConfig()` for proper Nuxt 3 compatibility
- Make sure the Socket.IO server URL is accessible from your Vercel deployment

### Troubleshooting

**Connection still failing?**
- Verify `NUXT_PUBLIC_SOCKET_URL` is set correctly in Vercel
- Check that the Socket.IO server is running and accessible
- Ensure CORS is properly configured on the Socket.IO server
- Check browser console for specific error messages

**Still connecting to Vercel?**
- Clear browser cache and hard refresh
- Verify the environment variable is set in Vercel (not just locally)
- Redeploy your Vercel app after setting the env var

