import {
  AppData,
  Producer,
  Transport,
} from 'mediasoup-client/lib/types';

let videoProducer: Producer | null = null;
let videoStream: MediaStream;

export async function createVideoProducer(
  sendTransport: Transport<AppData> | null,
) {
  if (!sendTransport) return;
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    const track = videoStream.getVideoTracks()[0];
    videoProducer = await sendTransport.produce({ track });
    console.log('Video producer created:', videoProducer.id);
  } catch (error) {
    console.log(error);
  }
}

export function closeVideoProducer() {
  if (videoProducer) {
    videoProducer.close();
    console.log('Video producer closed');
  }

  // Останавливаем треки, связанные с MediaStream
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop());
    console.log('All media tracks stopped');
  }
}
