<template>
  <div
    class="flex flex-col items-center cursor-pointer select-none transition-transform hover:scale-105"
    @mouseenter="$emit('hover')"
  >
    <div
      class="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/10 border border-white/20 shadow-lg flex items-center justify-center overflow-hidden mb-3"
    >
      <img :src="image" :alt="name" class="max-w-full max-h-full object-contain" />
    </div>
    <span class="text-lg font-semibold">{{ name }}</span>
  </div>
</template>

<script setup>
defineProps({
  image: { type: String, required: true },
  name: { type: String, required: true },
});
defineEmits(['hover']);
</script>

<style scoped>
</style>


