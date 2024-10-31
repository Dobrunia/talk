export {};

declare global {
  interface Window {
    serverClickHandler: typeof serverClickHandler;
  }
}
