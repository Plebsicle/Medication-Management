self.addEventListener('push', function (event) {
    const data = event.data.json();
    self.registration.showNotification('Medication Reminder', {
      body: data.message,
      icon: '/icon.png',
    });
  });
  