/// <reference types="vite/client" />

declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: any) => void;
  }
}

export {};