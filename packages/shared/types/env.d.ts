/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YOUTUBE_API_KEY: string;
  readonly VITE_GOOGLE_BOOKS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 