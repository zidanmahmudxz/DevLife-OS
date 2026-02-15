
/**
 * Notification Service for DevLife OS
 */

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.error("This browser does not support notifications.");
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const triggerTaskNotification = (title: string, body: string, priority: string) => {
  if (Notification.permission !== "granted") return;

  // Fixed type error: Some NotificationOptions like 'vibrate', 'badge', 'silent' are non-standard in some TS environments
  const options: any = {
    body,
    icon: "/icons/task-icon.png",
    badge: "/icons/badge-icon.png",
    vibrate: priority === 'High' ? [500, 110, 500, 110, 500] : [100],
    requireInteraction: priority === 'High',
    tag: `task-id-${Date.now()}`,
    silent: false,
  };

  const notification = new Notification(title, options);

  if (priority === 'High') {
    // Custom alarm sound for High Priority
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.loop = true;
    audio.play().catch(e => console.log("Audio interaction blocked"));
    
    // Auto-stop alarm when notification is closed
    notification.onclose = () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
};

export const snoozeTaskAction = (taskTitle: string, minutes: number) => {
  const snoozeUntil = new Date(Date.now() + minutes * 60000).toLocaleTimeString();
  console.log(`Snoozing ${taskTitle} until ${snoozeUntil}`);
  // In a full production app, this would trigger an update to the backend 'reminder_time'
  alert(`Snoozed "${taskTitle}" for ${minutes} minutes.`);
};
