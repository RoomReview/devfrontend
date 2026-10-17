/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_ENABLE_GOOGLE_SSO?: string
    readonly VITE_ENABLE_FACEBOOK_SSO?: string
    // more env variables
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
