import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App'
import antiInspect from './utils/antiInspect'
import { setupMobileApp } from './utils/mobile'
import { registerSW } from './utils/pwa'
import { initTracking } from './utils/tracking'

antiInspect()
initTracking()

// Register PWA service worker
registerSW()

// Initialize Capacitor mobile app if running natively
if (typeof window !== 'undefined' && typeof window.Capacitor?.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) {
  setupMobileApp()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
