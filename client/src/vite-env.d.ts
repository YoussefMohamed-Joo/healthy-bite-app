/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_TAWK_TO_PROPERTY_ID: string
  readonly VITE_TAWK_TO_WIDGET_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  Capacitor?: {
    isNativePlatform: () => boolean
    platform: string
  }
}
