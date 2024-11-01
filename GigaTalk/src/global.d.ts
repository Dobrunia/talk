export {};

declare global {
  interface Window {
    serverClickHandler: typeof serverClickHandler;
    showLogin: typeof showLogin;
    showRegister: typeof showRegister;
    closeAuthModal: typeof closeAuthModal;
    guestLoginHandler: typeof guestLoginHandler;
    handleRegister: typeof handleRegister;
    handleLogin: typeof handleLogin;
    voiceChannelClick: typeof voiceChannelClick;
    voiceChannelLeave: typeof voiceChannelLeave;
  }
}
