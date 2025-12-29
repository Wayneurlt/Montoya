# Montoya Socket.IO Server

This is a standalone Socket.IO server for the Montoya multiplayer features. It must be deployed separately from your Vercel deployment because Vercel doesn't support WebSocket connections.

## Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)

1. Go to [Railway](https://railway.app)
2. Sign up/login
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this `socket-server` folder (or create a new repo with just this folder)
5. Railway will auto-detect Node.js and deploy
6. Copy the deployment URL (e.g., `https://your-app.railway.app`)
7. In Vercel, add environment variable: `NUXT_PUBLIC_SOCKET_URL=https://your-app.railway.app`

### Option 2: Render

1. Go to [Render](https://render.com)
2. Sign up/login
3. Click "New" → "Web Service"
4. Connect your repo and set:
   - **Root Directory**: `socket-server`
   - **Build Command**: (leave empty)
   - **Start Command**: `node index.js`
5. Deploy and copy the URL
6. In Vercel, add: `NUXT_PUBLIC_SOCKET_URL=https://your-app.onrender.com`

### Option 3: Fly.io

1. Install Fly CLI: `npm install -g flyctl`
2. In this directory, run: `fly launch`
3. Follow prompts
4. Deploy: `fly deploy`
5. Get URL: `fly info`
6. In Vercel, add: `NUXT_PUBLIC_SOCKET_URL=https://your-app.fly.dev`

### Option 4: Your Own Server/VPS

1. Upload this folder to your server
2. Run `npm install`
3. Run `npm start` (or use PM2: `pm2 start index.js`)
4. Set up reverse proxy (nginx) if needed
5. In Vercel, add: `NUXT_PUBLIC_SOCKET_URL=https://your-server.com`

## Environment Variables

The server uses:
- `PORT` (optional, defaults to 3001)

## Testing Locally

1. Install dependencies: `npm install`
2. Start server: `npm start`
3. Server will run on `http://localhost:3001`
4. Test with: `http://localhost:3001/socket.io/`

## Important Notes

- This server handles all Socket.IO connections
- Your Vercel app (frontend) will connect to this server
- Make sure CORS is configured (already set to allow all origins)
- The server is stateless - rooms are stored in memory (will reset on restart)

