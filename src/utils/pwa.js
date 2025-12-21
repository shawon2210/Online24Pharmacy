// PWA installation prompt
export const usePWAInstall = () => {
  let deferredPrompt = null;

  const initPWA = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showInstallButton();
    });

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  };

  const showInstallButton = () => {
    const installButton = document.getElementById('pwa-install-btn');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', installPWA);
    }
  };

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
      
      const installButton = document.getElementById('pwa-install-btn');
      if (installButton) {
        installButton.style.display = 'none';
      }
    }
  };

  return { initPWA, installPWA };
};

// Push notifications
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const sendLocalNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      ...options
    });
  }
};