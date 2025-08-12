export function usePolling<T>(fn: () => Promise<T>, intervalMs = 2500) {
  const data = ref<T | null>(null);
  const error = ref<any>(null);
  const isActive = ref(false);
  let timer: any = null;

  const start = () => {
    if (isActive.value) return;
    isActive.value = true;
    const tick = async () => {
      try {
        data.value = await fn();
        error.value = null;
      } catch (e) {
        error.value = e;
      } finally {
        if (isActive.value) timer = setTimeout(tick, intervalMs);
      }
    };
    tick();
  };

  const stop = () => {
    isActive.value = false;
    if (timer) clearTimeout(timer);
  };

  onBeforeUnmount(stop);

  return { data, error, start, stop, isActive };
}


