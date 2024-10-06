import { ref } from 'vue';

export function useNotification() {
  // Define the notification types
  type NotificationType = 'info' | 'success' | 'warning' | 'error';

  // Define the Notification interface
  interface Notification {
    type: NotificationType;
    message: string;
  }

  // Define the notification state
  const notification = ref<Notification | null>(null);

  // Define the showNotification method
  const showNotification = (type: NotificationType, message: string) => {
    notification.value = { type, message };
  };

  // Define the hideNotification method
  const hideNotification = () => {
    notification.value = null;
  };

  // Return the NotificationState object
  return {
    notification,
    showNotification,
    hideNotification,
  };
}
