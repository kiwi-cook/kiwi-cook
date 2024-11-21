import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';

export function useDarkMode() {
  const $q = useQuasar();
  const isDark = ref(false);

  // Function to check system dark mode preference
  const checkSystemDarkMode = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Initialize dark mode based on system preference
  onMounted(() => {
    // Set initial value based on system preference
    const systemPrefersDark = checkSystemDarkMode();
    $q.dark.set(systemPrefersDark);
    isDark.value = systemPrefersDark;

    // Listen for system dark mode changes
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => {
        $q.dark.set(event.matches);
        isDark.value = event.matches;
      });
  });

  // Toggle function for manual control
  const toggleDarkMode = () => {
    $q.dark.toggle();
    isDark.value = $q.dark.isActive;
  };

  // Watch for changes in Quasar's dark mode
  watch(
    () => $q.dark.isActive,
    (newValue) => {
      isDark.value = newValue;
    },
  );

  return {
    isDark,
    toggleDarkMode,
  };
}
