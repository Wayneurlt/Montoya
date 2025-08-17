<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
      <NuxtLink to="/" class="text-sm text-white/70 hover:text-white">Back to Home</NuxtLink>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
      <div class="bg-white/5 border border-white/10 rounded-xl p-5">
        <div class="text-white/60 text-sm">Quick Links</div>
        <div class="mt-3 space-y-2">
          <NuxtLink to="/admin/analytics" class="block px-3 py-2 rounded bg-white/10 hover:bg-white/20">View Analytics</NuxtLink>
        </div>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-xl p-5">
        <div class="text-white/60 text-sm">Status</div>
        <div class="mt-3 text-white/80 text-sm">System nominal</div>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-xl p-5">
        <div class="text-white/60 text-sm">Shortcuts</div>
        <div class="mt-3 text-sm space-y-2">
          <NuxtLink to="/" class="block text-white/80 hover:text-white">Home</NuxtLink>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <div class="bg-white/5 border border-white/10 rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Overview</h2>
          <NuxtLink to="/admin/analytics" class="text-sm text-white/70 hover:text-white">Open Analytics</NuxtLink>
        </div>
        <div class="text-white/70 text-sm">High-level stats and summaries will appear here.</div>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Recent Activity</h2>
        </div>
        <div class="text-white/70 text-sm">No recent activity.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 
  layout: 'admin',
  middleware: 'admin'
})
</script>


