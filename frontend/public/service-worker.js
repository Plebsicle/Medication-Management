self.addEventListener('push', function(event) {
  try {
    const data = event.data.json();
    console.log('Push notification received:', data);
    
    const notificationOptions = {
      body: data.body || 'Time to take your medication',
      icon: '/icon.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1'
      },
      actions: [
        {
          action: 'close',
          title: 'Close',
          icon: '/close.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Medication Reminder', notificationOptions)
    );
  } catch (error) {
    console.error('Error handling push event:', error);
    
    // Show a default notification if data parsing fails
    event.waitUntil(
      self.registration.showNotification('Medication Reminder', {
        body: 'Time to take your medication',
        icon: '/icon.png'
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  event.notification.close();

  // This will open the app when the notification is clicked
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(function(clientList) {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/dashboard');
    })
  );
});

// Listen for messages from the client
self.addEventListener('message', event => {
  console.log('Service worker received message:', event.data);
  
  // Handle skipWaiting message
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service worker skipping waiting phase');
    self.skipWaiting();
  }
});

// Log service worker activation
self.addEventListener('activate', event => {
  console.log('Service worker activated');
  
  // Take control of all clients immediately
  event.waitUntil(clients.claim());
});

// Log service worker installation
self.addEventListener('install', event => {
  console.log('Service worker installed');
  
  // Force installation to proceed immediately
  event.waitUntil(self.skipWaiting());
}); 