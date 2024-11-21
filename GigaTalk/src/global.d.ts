export {};

declare global {
  interface Window {
    serverClickHandler: typeof serverClickHandler;
    showLogin: typeof showLogin;
    showRegister: typeof showRegister;
    guestLoginHandler: typeof guestLoginHandler;
    handleRegister: typeof handleRegister;
    handleLogin: typeof handleLogin;
    voiceChannelClick: typeof voiceChannelClick;
    voiceChannelLeave: typeof voiceChannelLeave;
    // handleNicknameChange: typeof handleNicknameChange;
    handleAvatarChange: typeof handleAvatarChange;
    closeProfileModal: typeof closeProfileModal;
    logOut: typeof logOut;
    microphoneMute: typeof microphoneMute;
    soundMute: typeof soundMute;
  }
}
