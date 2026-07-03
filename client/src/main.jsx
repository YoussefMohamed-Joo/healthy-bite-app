import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import antiInspect from './utils/antiInspect'
import { setupMobileApp } from './utils/mobile'
import { registerSW } from './utils/pwa'

antiInspect()

// Register PWA service worker
registerSW()

// Initialize Capacitor mobile app if running natively
if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform) {
  setupMobileApp()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
