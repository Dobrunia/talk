import { MediaKind, RtpCodecCapability } from 'mediasoup/node/lib/types';
import { types as MediasoupTypes } from 'mediasoup';

export const OPTIONS = {
  mediaCodecs: [
    {
      kind: 'audio' as MediaKind, // Указываем тип MediaKind явно
      mimeType: 'audio/opus',
      clockRate: 48000,
      channels: 2,
    },
    {
      kind: 'video' as MediaKind, // Указываем тип MediaKind явно
      mimeType: 'video/VP8',
      clockRate: 90000,
      parameters: {
        'x-google-start-bitrate': 1000,
      },
    },
    {
      kind: 'video' as MediaKind,
      mimeType: 'video/VP9',
      clockRate: 90000,
      parameters: {
        'profile-id': 2,
        'x-google-start-bitrate': 1000,
      },
    },
    {
      kind: 'video' as MediaKind,
      mimeType: 'video/h264',
      clockRate: 90000,
      parameters: {
        'packetization-mode': 1,
        'profile-level-id': '4d0032',
        'level-asymmetry-allowed': 1,
        'x-google-start-bitrate': 1000,
      },
    },
    {
      kind: 'video' as MediaKind,
      mimeType: 'video/h264',
      clockRate: 90000,
      parameters: {
        'packetization-mode': 1,
        'profile-level-id': '42e01f',
        'level-asymmetry-allowed': 1,
        'x-google-start-bitrate': 1000,
      },
    },
  ] as RtpCodecCapability[],
  createWorkerOptions: {
    logLevel: 'debug' as MediasoupTypes.WorkerLogLevel,
    logTags: [
      'info',
      'ice',
      'dtls',
      'rtp',
      'srtp',
      'rtcp',
      'rtx',
      'bwe',
      'score',
      'simulcast',
      'svc',
      'sctp',
    ] as MediasoupTypes.WorkerLogTag[],
    rtcMinPort: 2000,
    rtcMaxPort: 5020,
  },
};
