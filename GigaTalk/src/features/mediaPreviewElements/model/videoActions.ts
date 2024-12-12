import { AppData, Consumer } from 'mediasoup-client/lib/types';

export function pauseVideoConsumer(consumer: Consumer<AppData>) {
  if (consumer) {
    consumer.pause();
    console.log('Video consumer paused');
  }
}
export function resumeVideoConsumer(consumer: Consumer<AppData>) {
  if (consumer) {
    consumer.resume();
    console.log('Video consumer resume');
  }
}
