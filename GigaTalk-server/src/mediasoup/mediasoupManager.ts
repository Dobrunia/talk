import * as mediasoup from 'mediasoup';
import { Worker, Router, WebRtcTransport } from 'mediasoup/node/lib/types';

// Хранение воркеров и роутеров для каждого канала
const channelWorkers = new Map<string, { worker: Worker; router: Router }>();

// Функция для получения или создания воркера и роутера для канала
async function getOrCreateWorkerAndRouter(
  channelId: string,
): Promise<{ worker: Worker; router: Router }> {
  if (channelWorkers.has(channelId)) {
    return channelWorkers.get(channelId)!;
  } else {
    // Создаем воркер
    const worker = await mediasoup.createWorker();

    // Создаем роутер с поддерживаемыми медиа-кодеками
    const router = await worker.createRouter({
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
        },
        // Добавьте видеокодеки, если необходимо
      ],
    });

    // Сохраняем воркер и роутер для канала
    channelWorkers.set(channelId, { worker, router });

    return { worker, router };
  }
}

export async function createWebRtcTransportForClient(channelId: string): Promise<any> {
  const { router } = await getOrCreateWorkerAndRouter(channelId);

  // Опции для WebRtcTransport
  const transportOptions = {
    listenIps: [
      {
        ip: '0.0.0.0', // Прослушивать на всех сетевых интерфейсах
        announcedIp: '127.0.0.1', // Для localhost используем 127.0.0.1
      },
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
  };

  // Создаем транспорт
  const transport: WebRtcTransport = await router.createWebRtcTransport(
    transportOptions,
  );

  // Устанавливаем максимальную входящую скорость (опционально)
  //await transport.setMaxIncomingBitrate(1500000);

  // Возвращаем параметры транспорта клиенту
  return {
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
  };
}
