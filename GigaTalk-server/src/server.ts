import express from 'express';
import http from 'http';
import cors from 'cors';
import { router } from './router.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import './db/sessionCleanup.ts';
import { initializeSocket } from './socket/socket.ts';
import dotenv from 'dotenv';
import { initializeWorkers } from './mediasoup/worker.ts';

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT || 3000;

app.use(
  cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  }),
);
app.use(express.json());
app.use(router);
app.use(errorHandler);

const server = http.createServer(app);

// Запуск сервера с обработкой ошибок
async function startServer() {
  try {
    // Инициализируем воркеры
    await initializeWorkers()
    // Инициализируем сокеты
    initializeSocket(server);
    server.listen(port, () => {
      console.log(`Server is running on ${port}`);
    });
  } catch (error) {
    console.error('Ошибка запуска сервера:', error);
    process.exit(1); // Завершаем процесс при ошибке
  }
}

startServer();
