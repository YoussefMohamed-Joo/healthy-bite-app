import { App } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { checkForUpdate } from './appUpdate'

export function showUpdatePrompt(data) {
  const existing = document.getElementById('hb-update-prompt')
  if (existing) existing.remove()

  const div = document.createElement('div')
  div.id = 'hb-update-prompt'
  div.innerHTML = `
    <div style="position:fixed;bottom:0;left:0;right:0;z-index:99999;background:white;border-top:2px solid #237C3C;padding:16px 20px;box-shadow:0 -4px 20px rgba(0,0,0,0.15);font-family:'Cairo',sans-serif;animation:slideUp 0.3s ease">
      <div style="display:flex;align-items:center;justify-content:space-between;max-width:500px;margin:auto">
        <div>
          <div style="font-weight:700;color:#18181b;font-size:14px">تحديث جديد v${data.version}</div>
          <div style="font-size:11px;color:#71717a;margin-top:2px">${data.releaseNotes ? data.releaseNotes.substring(0, 80) : 'التحديث متاح'}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button id="hb-update-later" style="padding:8px 16px;border:1px solid #e4e4e7;border-radius:10px;background:white;font-size:12px;font-weight:600;cursor:pointer;color:#71717a">لاحقاً</button>
          <a href="${data.apkUrl}" style="padding:8px 16px;border-radius:10px;background:#237C3C;color:white;font-size:12px;font-weight:700;text-decoration:none;display:inline-block" target="_blank">تحديث</a>
        </div>
      </div>
    </div>
    <style>
      @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
    </style>
  `
  document.body.appendChild(div)
  document.getElementById('hb-update-later')?.addEventListener('click', () => div.remove())
}

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

  const update = await checkForUpdate()
  if (update?.apkUrl) {
    setTimeout(() => showUpdatePrompt(update), 2000)
  }
}
