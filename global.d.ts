// global.d.ts
declare global {
  interface Window {
    dataLayer: any[];
    _gtag: (...args: any[]) => void;
  }
}
