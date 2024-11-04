import * as mediasoup from 'mediasoup';
import { Worker, Router } from 'mediasoup/node/lib/types';
import { config } from './config';

interface WorkerWithRouter {
    worker: Worker;
    router: Router;
}

const workers: WorkerWithRouter[] = [];
let nextMediasoupWorkerIdx = 0; // Индекс для кругового распределения воркеров

// Функция для создания и настройки Worker
const createWorker = async (): Promise<Worker> => {
    const worker = await mediasoup.createWorker({
        rtcMinPort: config.mediasoup.worker.rtcMinPort,
        rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
        logLevel: config.mediasoup.worker.logLevel,
        logTags: config.mediasoup.worker.logTags,
    });

    worker.on('died', () => {
        console.error('Mediasoup worker died, exiting...');
        process.exit(1); // Перезапускаем сервер при падении воркера
    });

    console.log('Mediasoup worker создан с ID:', worker.pid);
    return worker;
};

// Функция для инициализации всех воркеров и роутеров
export const initializeWorkers = async () => {
    const numWorkers = config.mediasoup.numWorkers;

    for (let i = 0; i < numWorkers; i++) {
        const worker = await createWorker();

        // Создаем Router для каждого Worker
        const router = await worker.createRouter({
            mediaCodecs: config.mediasoup.router.mediaCodecs,
        });

        workers.push({ worker, router });
        console.log(`Worker и Router созданы. Worker PID: ${worker.pid}`);
    }
};

// Функция для получения следующего воркера по круговому распределению
export const getNextWorker = (): WorkerWithRouter => {
    const workerWithRouter = workers[nextMediasoupWorkerIdx];
    nextMediasoupWorkerIdx = (nextMediasoupWorkerIdx + 1) % workers.length;
    return workerWithRouter;
};

// Экспортируем worker массив для доступа из других частей приложения (например, WebSocket)
export { workers };
