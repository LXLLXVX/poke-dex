import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000';

function LiveActivityFeed() {
	const [events, setEvents] = useState([]);
	const [connectionState, setConnectionState] = useState('connecting');
	const [notificationPermission, setNotificationPermission] = useState(
		typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'unsupported',
	);
	const serviceWorkerRef = useRef(null);

	const canUseBrowserNotifications = typeof window !== 'undefined' && 'Notification' in window;

	const showBrowserNotification = async (event) => {
		if (!canUseBrowserNotifications) return;
		if (window.Notification.permission !== 'granted') return;

		const options = {
			body: event.message,
			tag: `${event.type}-${event.action}`,
			renotify: true,
		};

		// Prefer service worker registration (so notifications work when page is closed)
		try {
			let registration = serviceWorkerRef.current || null;
			if (!registration && 'serviceWorker' in navigator) {
				registration = await navigator.serviceWorker.getRegistration();
			}

			if (registration && typeof registration.showNotification === 'function') {
				registration.showNotification('Poke Team Live', options).catch(() => {});
				return;
			}
		} catch (e) {
			// fallthrough to page Notification
		}

		try {
			new window.Notification('Poke Team Live', options);
		} catch (e) {
			// ignore
		}
	};

	const requestNotifications = async () => {
		if (!canUseBrowserNotifications) {
			setNotificationPermission('unsupported');
			return;
		}

		const permission = await window.Notification.requestPermission();
		setNotificationPermission(permission);
	};

	const sendTestNotification = async () => {
		if (!canUseBrowserNotifications) {
			setNotificationPermission('unsupported');
			return;
		}

		if (window.Notification.permission !== 'granted') {
			const permission = await window.Notification.requestPermission();
			setNotificationPermission(permission);
			if (permission !== 'granted') {
				return;
			}
		}

		const options = {
			body: 'Esta es una notificacion de prueba manual.',
			tag: 'manual-test',
		};

		if (serviceWorkerRef.current) {
			serviceWorkerRef.current.showNotification('Poke Team Live', options);
			return;
		}

		new window.Notification('Poke Team Live', options);
	};

	useEffect(() => {
		let active = true;

		const registerServiceWorker = async () => {
			if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
				return;
			}

			try {
				const registration = await navigator.serviceWorker.register('/notification-sw.js');
				if (active) {
					serviceWorkerRef.current = registration;
				}
			} catch {
				serviceWorkerRef.current = null;
			}
		};

		registerServiceWorker();

		const socket = io(SOCKET_URL, {
			transports: ['websocket'],
		});

		socket.on('connect', () => {
			setConnectionState('connected');
		});

		socket.on('disconnect', () => {
			setConnectionState('disconnected');
		});

		socket.on('activity', (event) => {
			setEvents((current) => [event, ...current].slice(0, 5));
			showBrowserNotification(event);
		});

		socket.on('connect_error', () => {
			setConnectionState('error');
		});

		return () => {
			active = false;
			socket.disconnect();
		};
	}, []);

	return (
		<aside className="live-activity-panel">
			<header className="live-activity-panel__header">
				<div>
					<p className="eyebrow">WebSockets</p>
					<h3>Actividad en tiempo real</h3>
				</div>
				<div className="live-activity-panel__actions">
					<span className={`live-activity-badge live-activity-badge--${connectionState}`}>{connectionState}</span>
					<span className={`live-activity-badge live-activity-badge--${notificationPermission}`}>
						{notificationPermission === 'default' ? 'sin permiso' : notificationPermission}
					</span>
					<button type="button" className="ghost ghost--muted" onClick={requestNotifications}>
						Activar notificaciones
					</button>
					<button type="button" className="ghost" onClick={sendTestNotification}>
						Probar notificacion
					</button>
				</div>
			</header>
			{events.length === 0 ? (
				<p className="muted">Espera cambios en trainers, pokemon o types para ver notificaciones en vivo.</p>
			) : (
				<ul className="live-activity-list">
					{events.map((event, index) => (
						<li key={`${event.timestamp}-${index}`}>
							<strong>{event.type}</strong>
							<span>{event.action}</span>
							<p>{event.message}</p>
							<small>{new Date(event.timestamp).toLocaleTimeString()}</small>
						</li>
					))}
				</ul>
			)}
		</aside>
	);
}

export default LiveActivityFeed;