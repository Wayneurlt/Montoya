<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Notivue v-slot="item">
      <Notification :item="item" />
    </Notivue>
  </UApp>
</template>

<script setup lang="ts">
import { useAnalytics } from '~/composables/useAnalytics'
const { trackPageView } = useAnalytics()

onMounted(() => {
  console.log(window.innerHeight, window.innerWidth);
  
  trackPageView('app')
});
</script>
