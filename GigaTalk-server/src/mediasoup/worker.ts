import os from 'os';
import * as mediasoup from 'mediasoup';
import { OPTIONS } from './options.ts';

const consM = `\x1b[33mmediasoup\x1b[0m `;
const workers: mediasoup.types.Worker[] = [];

const createWorker = async () => {
  const worker: mediasoup.types.Worker = await mediasoup.createWorker(OPTIONS.createWorkerOptions);
  console.debug(`${consM}worker pid ${worker.pid}`);

  worker.on('died', (error) => {
    // Это означает, что произошло что-то серьезное, поэтому закройте приложение.
    console.error(consM, 'mediasoup worker has died ', error);
    setTimeout(() => process.exit(1), 2000); // выход через 2 секунды
  });

  return worker;
};

// Мы создаем Workers, как только наше приложение запускается.
export async function initializeWorkers() {
  for (let i = 0; i < os.cpus().length; i++) {
    const newWorker = await createWorker();
    workers.push(newWorker);
  }
  //console.log("workers", workers);
}

export function getWorker(): mediasoup.types.Worker {
  return workers[Math.floor(Math.random() * workers.length)];
}
