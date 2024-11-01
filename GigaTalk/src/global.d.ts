export {};

declare global {
  interface Window {
    serverClickHandler: typeof serverClickHandler;
    showLogin: typeof showLogin;
    showRegister: typeof showRegister;
    closeAuthModal: typeof closeAuthModal;
  }
}
