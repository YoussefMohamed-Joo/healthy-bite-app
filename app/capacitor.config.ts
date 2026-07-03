import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.healthybite.app',
  appName: 'HealthyBite',
  webDir: '../client/dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'helthybite.vercel.app',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#237C3C',
      androidSplashResourceName: 'splash',
      androidScaleType: 'centerCrop',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#237C3C',
      overlaysWebView: false,
    },
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    useLegacyBridge: false,
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
  includePlugins: [
    '@capacitor/app',
    '@capacitor/splash-screen',
    '@capacitor/status-bar',
  ],
}

export default config
