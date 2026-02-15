
self.addEventListener('push', function(event) {
  const data = event.data.json();
  const priority = data.priority || 'Medium';

  const options = {
    body: data.body,
    icon: '/icons/task-icon.png',
    badge: '/icons/badge-icon.png',
    vibrate: priority === 'High' ? [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500] : [100],
    requireInteraction: priority === 'High',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
