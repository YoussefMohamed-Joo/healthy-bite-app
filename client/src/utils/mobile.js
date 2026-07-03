import { App } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { checkUpdate } from './appUpdate'
import { dispatchUpdateFound } from './updateEvent'

export async function setupMobileApp() {
  await SplashScreen.hide()
  await StatusBar.setStyle({ style: Style.Dark })
  await StatusBar.setBackgroundColor({ color: '#237C3C' })

  App.addListener('backButton', ({ canGoBack }) => {
    if (!canGoBack) {
      App.exitApp()
    } else {
      window.history.back()
    }
  })

  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      document.body.classList.remove('app-background')
    } else {
      document.body.classList.add('app-background')
    }
  })

  App.addListener('appUrlOpen', (data) => {
    const url = new URL(data.url)
    const path = url.pathname
    if (path && path !== '/') {
      window.location.href = path
    }
  })

  const update = await checkUpdate()
  if (update) {
    setTimeout(() => dispatchUpdateFound(update, update.forceUpdate), 2000)
  }
}
