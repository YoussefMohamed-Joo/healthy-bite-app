import { App } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'

export async function setupMobileApp() {
  // Hide splash screen when app is ready
  await SplashScreen.hide()

  // Configure status bar
  await StatusBar.setStyle({ style: Style.Dark })
  await StatusBar.setBackgroundColor({ color: '#237C3C' })

  // Handle back button (Android) — exit if on main page
  App.addListener('backButton', ({ canGoBack }) => {
    if (!canGoBack) {
      App.exitApp()
    } else {
      window.history.back()
    }
  })

  // Handle app state changes
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      document.body.classList.remove('app-background')
    } else {
      document.body.classList.add('app-background')
    }
  })

  // Handle deep links
  App.addListener('appUrlOpen', (data) => {
    const url = new URL(data.url)
    const path = url.pathname
    if (path && path !== '/') {
      window.location.href = path
    }
  })
}
