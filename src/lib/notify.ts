export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

export function sendNotification(title: string, body: string) {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    const notification = new Notification(title, { body, icon: "/favicon.svg", tag: "pomodoro" });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {
    return;
  }
}
