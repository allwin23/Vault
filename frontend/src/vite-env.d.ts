/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_USE_UUID_PROCESSING_IDS: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}