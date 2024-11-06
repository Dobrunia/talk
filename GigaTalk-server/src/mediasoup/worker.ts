import os from "os";
import mediasoup from "mediasoup";
import { mediaCodecs, createWorkerOptions } from "./options.ts";

const workers: Worker[] = [];

const createWorker = async () => {
  const worker = await mediasoup.createWorker(createWorkerOptions as any);
  console.debug(`worker pid ${worker.pid}`);

  worker.on('died', (error) => {
    // Это означает, что произошло что-то серьезное, поэтому закройте приложение.
    console.error('mediasoup worker has died ', error);
    setTimeout(() => process.exit(1), 2000); // выход через 2 секунды
  });

  return worker;
};

// Мы создаем Workers, как только наше приложение запускается.
export async function initializeWorkers() {
  for (let i = 0; i < os.cpus().length; i++) {
    const newWorker = await createWorker();
    workers.push(newWorker as any);
  }
  console.log("workers", workers);
}
