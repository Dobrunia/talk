import { Consumer, Producer, WebRtcTransport } from 'mediasoup/node/lib/types';

export type ClientData = {
  userId: string;
  username: string;
  userAvatar: string | null;
  permission: number | null;
  // currentChannelId: string | null;
  transports: {
    sendTransport: WebRtcTransport | null;
    recvTransport: WebRtcTransport | null;
  };
  producers: {
    audioProducer: Producer | null;
    videoProducer: Producer | null;
    screenProducer: Producer | null;
  };
  consumers?: Array<Consumer>;
};

export type UserInfo = {
  userId: string;
  username: string;
  userAvatar: string | null;
};
