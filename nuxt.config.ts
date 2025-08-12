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

    // --- NEW CONFIGURATION ADDED HERE ---
    // Keys inside 'public' are available on the client-side
    public: {
      geminiApiKey: process.env.GEMINI_API_KEY,
    },
    // --- END OF NEW CONFIGURATION ---
  },
  app: {
    head: {
      title: "Montoya",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width,initial-scale=1" },
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
  notivue: {
    limit: 3,
    avoidDuplicates: true,
    notifications: {
      global: {
        duration: 5000,
      },
    },
  },
});
