import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import startGlobalNotifications from './services/globalNotifications'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// arrancar el listener global de notificaciones (no bloqueante)
startGlobalNotifications().catch(() => {});
