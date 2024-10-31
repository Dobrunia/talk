export {};

declare global {
  interface Window {
    renderServerInfo: typeof renderServerInfo;
  }
}
