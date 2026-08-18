// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/ui",
    "notivue/nuxt",
    "@pinia/nuxt",
    "@prisma/nuxt",
    "@nuxt/fonts",
    "@nuxt/icon",
    "nuxt-auth-utils",
    "@vite-pwa/nuxt",
  ],
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: [
    "~/assets/css/main.css",
    "notivue/notification.css",
    "notivue/animations.css",
  ],
  icon: {
    clientBundle: {
      scan: true,
      sizeLimitKb: 256,
    },
  },
  runtimeConfig: {
    // These are your existing server-side keys
    oauth: {
      google: {
        clientId: "",
        clientSecret: "",
        redirectURL: process.env.GOOGLE_REDIRECT_URL,
      },
      facebook: {
        clientId: "",
        clientSecret: "",
      },
    },
    environment: process.env.ENVIROMENT,

    // IntaSend (M-Pesa) — server-only, never exposed to the client
    intasendPublishableKey: process.env.INTASEND_PUBLISHABLE_KEY,
    intasendSecretKey: process.env.INTASEND_SECRET_KEY,
    intasendTestMode: process.env.INTASEND_TEST_MODE !== "false",

    // --- NEW CONFIGURATION ADDED HERE ---
    // Keys inside 'public' are available on the client-side
    public: {
      geminiApiKey: process.env.GEMINI_API_KEY,
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL,
      multiplayerPassAmount: Number(process.env.MULTIPLAYER_PASS_AMOUNT || 20),
      multiplayerPassHours: Number(process.env.MULTIPLAYER_PASS_HOURS || 24),
    },
    // --- END OF NEW CONFIGURATION ---
  },
  app: {
    head: {
      title: "Montoya",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,interactive-widget=overlays-content" },
      ],
    },
  },
  vite: {
    server: {
      allowedHosts: ["958d-105-160-105-173.ngrok-free.app"],
    },
    resolve: {
      alias: {
        ".prisma/client/index-browser":
          "./node_modules/.prisma/client/index-browser.js",
      },
    },
  },
  nitro: {
    // Prisma's generated client re-exports via bare specifiers like ".prisma/client/default"
    // that Rollup's resolver rejects as invalid package names. Leave them external so
    // Node's own module resolution (which handles the real node_modules/.prisma folder
    // fine) takes over at runtime instead of Nitro trying to bundle them.
    rollupConfig: {
      external: [/^\.prisma\/client/],
    },
  },
  notivue: {
    limit: 3,
    avoidDuplicates: true,
    notifications: {
      global: {
        duration: 5000,
      },
    },
  },
  pwa: {
    registerType: "autoUpdate",
    includeAssets: ["favicon.ico", "robots.txt", "logo.webp"],
    manifest: {
      name: "Montoya",
      short_name: "Montoya",
      description: "Montoya — multiplayer Truth or Dare and party games.",
      theme_color: "#c8253f",
      background_color: "#0a0a0d",
      display: "standalone",
      start_url: "/",
      icons: [
        { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
        { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
        {
          src: "maskable-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico,webp}"],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      // Enabled so the install prompt / button can actually be tested with `npm run dev` —
      // Chrome only fires `beforeinstallprompt` once a service worker is registered and
      // controlling the page, and that never happens with this left disabled.
      enabled: true,
      type: "module",
    },
  },
});
