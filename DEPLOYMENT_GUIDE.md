# Deployment Guide

## Current setup

Montoya is a single Nuxt 3 app deployed as one process — there is no separate
Socket.IO server. Real-time multiplayer is handled by the Nitro server plugin
at `server/plugins/socket.io.ts`, which runs in the same process as the HTTP
server and listens on the same port.

- **Host:** GCP VM, managed by PM2 (see `.github/workflows/temi.yaml`)
- **Port:** `3200` (set via `PORT` / `NITRO_PORT`)
- **Reverse proxy:** nginx forwards both normal HTTP traffic and the
  `/socket.io/` path to port 3200 — see `nginx-websocket-config.example`.
- **Deploy trigger:** push to `main` runs the `Deploy Remotely` GitHub Action,
  which builds the app, rsyncs `.output/` to the VM, and restarts the PM2
  process.

### Required environment variables

Set these on the VM (or in the CI workflow's generated PM2 ecosystem file):

```
DATABASE_URL=postgresql://...
NUXT_SESSION_PASSWORD=...
JWT_SECRET=...
ADMIN_USERNAME=...   # used only by db:seed to provision the admin account
ADMIN_PASSWORD=...   # used only by db:seed to provision the admin account
```

`NUXT_PUBLIC_SOCKET_URL` is intentionally left unset in production — the
client falls back to `window.location.origin` (see `composables/useMultiplayer.ts`),
which is correct since the socket server and the web app are the same process.
Only set it if you deliberately split the socket server out again.

### Local development

```bash
npm install
npm run dev
```

The dev server serves both HTTP routes and the Socket.IO endpoint on the same
port, matching production.
