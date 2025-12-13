/**
 * Service Worker registration and management utilities
 */

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

/**
 * Register service worker
 */
export async function registerServiceWorker(config: ServiceWorkerConfig = {}): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('Service Worker registered successfully:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New content is available
            console.log('New content available, please refresh');
            config.onUpdate?.(registration);
          } else {
            // Content is cached for offline use
            console.log('Content is cached for offline use');
            config.onSuccess?.(registration);
          }
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    config.onError?.(error as Error);
    return null;
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const result = await registration.unregister();
    console.log('Service Worker unregistered:', result);
    return result;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
}

/**
 * Check if service worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Get service worker registration
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error('Failed to get service worker registration:', error);
    return null;
  }
}

/**
 * Send message to service worker
 */
export async function sendMessageToServiceWorker(message: any): Promise<any> {
  const registration = await getServiceWorkerRegistration();
  if (!registration || !registration.active) {
    throw new Error('No active service worker found');
  }

  return new Promise((resolve, reject) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      if (event.data.error) {
        reject(new Error(event.data.error));
      } else {
        resolve(event.data);
      }
    };

    if (registration.active) {
      registration.active.postMessage(message, [messageChannel.port2]);
    }
  });
}

/**
 * Skip waiting for service worker update
 */
export async function skipWaiting(): Promise<void> {
  try {
    await sendMessageToServiceWorker({ type: 'SKIP_WAITING' });
  } catch (error) {
    console.error('Failed to skip waiting:', error);
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  try {
    await sendMessageToServiceWorker({ type: 'CLEAR_CACHE' });
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
}

/**
 * Get service worker version
 */
export async function getServiceWorkerVersion(): Promise<string | null> {
  try {
    const response = await sendMessageToServiceWorker({ type: 'GET_VERSION' });
    return response.version;
  } catch (error) {
    console.error('Failed to get service worker version:', error);
    return null;
  }
}

/**
 * Check online status
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Listen for online/offline events
 */
export function addConnectionListener(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

/**
 * Service worker update notification
 */
export function showUpdateNotification(registration: ServiceWorkerRegistration): void {
  // Create a simple notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4f46e5;
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    max-width: 300px;
  `;
  
  notification.innerHTML = `
    <div style="margin-bottom: 8px; font-weight: 600;">
      New version available!
    </div>
    <div style="margin-bottom: 12px; opacity: 0.9;">
      Click to update and reload the page.
    </div>
    <button onclick="this.parentElement.remove()" style="
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 8px;
    ">Dismiss</button>
    <button id="update-btn" style="
      background: white;
      border: none;
      color: #4f46e5;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    ">Update</button>
  `;

  document.body.appendChild(notification);

  // Handle update button click
  const updateBtn = notification.querySelector('#update-btn');
  updateBtn?.addEventListener('click', async () => {
    await skipWaiting();
    window.location.reload();
  });

  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 10000);
}

/**
 * Service worker status
 */
export interface ServiceWorkerStatus {
  supported: boolean;
  registered: boolean;
  active: boolean;
  waiting: boolean;
  installing: boolean;
  version: string | null;
}

/**
 * Get service worker status
 */
export async function getServiceWorkerStatus(): Promise<ServiceWorkerStatus> {
  const supported = isServiceWorkerSupported();
  
  if (!supported) {
    return {
      supported: false,
      registered: false,
      active: false,
      waiting: false,
      installing: false,
      version: null
    };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const version = await getServiceWorkerVersion();

    return {
      supported: true,
      registered: !!registration,
      active: !!registration?.active,
      waiting: !!registration?.waiting,
      installing: !!registration?.installing,
      version
    };
  } catch (error) {
    console.error('Failed to get service worker status:', error);
    return {
      supported: true,
      registered: false,
      active: false,
      waiting: false,
      installing: false,
      version: null
    };
  }
}

/**
 * Initialize service worker with default configuration
 */
export function initializeServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  return registerServiceWorker({
    onUpdate: (registration) => {
      console.log('Service Worker update available');
      showUpdateNotification(registration);
    },
    onSuccess: (registration) => {
      console.log('Service Worker registered successfully');
    },
    onError: (error) => {
      console.error('Service Worker registration failed:', error);
    }
  });
}
