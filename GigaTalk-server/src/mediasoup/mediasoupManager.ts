// mediasoupManager.ts
import { Router, WebRtcTransport, RtpCapabilities, Producer, MediaKind } from 'mediasoup/node/lib/types';
import { workers } from './worker';
import { config } from './config';
import WebSocket from 'ws';

// Handle client joining a channel and provide capabilities
export function handleJoinChannel(ws: WebSocket, serverId: string, channelId: string) {
  const router = getRouterForChannel(serverId, channelId);

  if (!router) {
    throw new Error(`Router не найден для канала ${channelId}`);
  }

  // Send `rtpCapabilities` to client
  ws.send(JSON.stringify({
    type: 'rtpCapabilities',
    payload: router.rtpCapabilities,
  }));
}

// Get router for a specific channel
function getRouterForChannel(serverId: string, channelId: string): Router | undefined {
  // Поиск Router для канала среди существующих воркеров
  const workerWithRouter = workers.find(({ router }) => router.appData.serverId === serverId && router.appData.channelId === channelId);
  return workerWithRouter?.router;
}

// Create transport for sending or receiving media
export async function createTransport(ws: WebSocket, serverId: string, channelId: string, direction: 'send' | 'recv') {
  const router = getRouterForChannel(serverId, channelId);

  if (!router) {
    throw new Error(`Router не найден для канала ${channelId}`);
  }

  const transport = await router.createWebRtcTransport({
    listenIps: config.mediasoup.webRtcTransport.listenIps,
    enableUdp: config.mediasoup.webRtcTransport.enableUdp,
    enableTcp: config.mediasoup.webRtcTransport.enableTcp,
    preferUdp: config.mediasoup.webRtcTransport.preferUdp,
  });

  // Initialize appData if undefined
  if (typeof router.appData !== 'object' || router.appData === null) {
    router.appData = {};
  }

  // Store transport in router appData for future reference
  if (!Array.isArray(router.appData.transports)) {
    router.appData.transports = [];
  }
  (router.appData.transports as WebRtcTransport[]).push(transport);

  ws.send(JSON.stringify({
    type: 'transportOptions',
    direction,
    payload: {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    },
  }));
}

// Handle media production (audio/video)
export async function handleProduce(ws: WebSocket, transportId: string, kind: MediaKind, rtpParameters: any) {
  const transport = getTransportById(transportId);

  if (!transport) {
    throw new Error(`Transport не найден с ID ${transportId}`);
  }

  const producer = await transport.produce({ kind, rtpParameters });

  // Initialize appData if undefined
  if (typeof transport.appData !== 'object' || transport.appData === null) {
    transport.appData = {};
  }

  // Store producer in transport appData for future reference
  if (!Array.isArray(transport.appData.producers)) {
    transport.appData.producers = [];
  }
  (transport.appData.producers as Producer[]).push(producer);

  ws.send(JSON.stringify({
    type: 'producerCreated',
    payload: { producerId: producer.id },
  }));
}

// Handle media consumption from other users
export async function handleConsume(ws: WebSocket, producerId: string, rtpCapabilities: RtpCapabilities) {
  const producer = getProducerById(producerId);

  if (!producer) {
    throw new Error(`Producer не найден с ID ${producerId}`);
  }

  // Use the router to get the transport associated with the producer
  const transport = producer.transport as WebRtcTransport;

  if (!transport) {
    throw new Error(`Transport не найден для Producer с ID ${producerId}`);
  }

  // Create a consumer for the specified producer
  const consumer = await transport.consume({
    producerId,
    rtpCapabilities,
    paused: false,
  });

  ws.send(JSON.stringify({
    type: 'consumerParameters',
    payload: {
      id: consumer.id,
      producerId: producer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    },
  }));
}

// Helper functions to get Transport and Producer by their ID
function getTransportById(transportId: string): WebRtcTransport | undefined {
  for (const { router } of workers) {
    const transports = router.appData.transports as WebRtcTransport[] | undefined;
    const transport = transports?.find((t) => t.id === transportId);
    if (transport) return transport;
  }
  return undefined;
}

function getProducerById(producerId: string): Producer | undefined {
  for (const { router } of workers) {
    const producers = router.appData.producers as Producer[] | undefined;
    const producer = producers?.find((p) => p.id === producerId);
    if (producer) return producer;
  }
  return undefined;
}
