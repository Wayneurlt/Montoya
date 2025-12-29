# Deployment Guide for Socket.IO with Vercel

## Problem
Vercel is a serverless platform and **does not support persistent WebSocket connections** required by Socket.IO. This means Socket.IO cannot run directly on Vercel.

## Solution: Separate Socket.IO Server

You need to deploy your Socket.IO server separately on a platform that supports WebSockets.

### Recommended Platforms:
1. **Railway** (https://railway.app) - Easy setup, good free tier
2. **Render** (https://render.com) - Free tier available
3. **Fly.io** (https://fly.io) - Good for Node.js apps
4. **Your GCP VM** - You already have this set up!

### Option 1: Use Your Existing GCP VM (Recommended)

Since you already have a GCP VM deployment setup, you can:

1. **Deploy the full app to GCP VM** (where Socket.IO will work)
2. **OR** deploy only the Socket.IO server to GCP VM and the main app to Vercel

### Option 2: Deploy Socket.IO Server to Railway/Render

1. Create a separate minimal Socket.IO server
2. Deploy it to Railway or Render
3. Point your Vercel app to that Socket.IO server using `NUXT_PUBLIC_SOCKET_URL`

## Environment Variables

In your Vercel deployment settings, add:

```
NUXT_PUBLIC_SOCKET_URL=https://your-socket-server.com
```

This will make the Socket.IO client connect to your separate server instead of trying to connect to Vercel.

## Quick Fix: Deploy Full App to GCP VM Instead

Since you already have GCP VM deployment configured, the easiest solution is to:
1. Deploy the entire app to your GCP VM (where Socket.IO works)
2. Point your domain (www.montoya.ke) to your GCP VM instead of Vercel

This way everything works together without needing separate servers.

