import os from 'os';
import { WorkerLogTag, RtpCodecCapability, TransportListenIp } from 'mediasoup/node/lib/types';

export const config = {
    listenIp: '0.0.0.0',
    listenPort: 3016,

    mediasoup: {
        numWorkers: Object.keys(os.cpus()).length,

        worker: {
            rtcMinPort: 10000,
            rtcMaxPort: 10100,
            logLevel: 'debug',
            logTags: [
                'info',
                'ice',
                'dtls',
                'rtp',
                'srtp',
                'rtcp',
            ] as WorkerLogTag[],
        },

        router: {
            mediaCodecs: [
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2,
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000,
                    parameters: {},
                },
            ] as RtpCodecCapability[],
        },

        // Настройки WebRtcTransport
        webRtcTransport: {
            listenIps: [
                {
                    ip: '0.0.0.0', // Локальный IP-адрес, на котором будет работать транспорт
                    announcedIp: 'YOUR_PUBLIC_IP' // Замените YOUR_PUBLIC_IP на ваш публичный IP, если сервер доступен в интернете
                }
            ] as TransportListenIp[],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
        },
    },
} as const;
