import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000';

async function ensureServiceWorker() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;

  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) return reg;
    return await navigator.serviceWorker.register('/notification-sw.js');
  } catch (e) {
    return null;
  }
}

export async function startGlobalNotifications() {
  if (typeof window === 'undefined') return;

  const registration = await ensureServiceWorker();

  const canNotify = typeof window.Notification !== 'undefined' && window.Notification.permission === 'granted';

  const socket = io(SOCKET_URL, { transports: ['websocket'] });

  socket.on('activity', async (event) => {
    const options = { body: event.message, tag: `${event.type}-${event.action}`, renotify: true };

    try {
      const reg = registration || (('serviceWorker' in navigator) ? await navigator.serviceWorker.getRegistration() : null);
      if (reg && typeof reg.showNotification === 'function') {
        reg.showNotification('Poke Team Live', options).catch(() => {});
        return;
      }
    } catch (e) {
      // ignore
    }

    if (canNotify) {
      try {
        new window.Notification('Poke Team Live', options);
      } catch (e) {}
    }
  });

  return socket;
}

export default startGlobalNotifications;
