import express from 'express';
import http from 'http';
import cors from 'cors';
import { router } from './router.ts';
import { setupWebSocket } from './socket/socket.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import './db/sessionCleanup.ts';

const app = express();
const port = 3000;

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  }),
);
app.use(express.json());
app.use(router);
app.use(errorHandler);

const server = http.createServer(app);

// Инициализация WebSocket сервера
setupWebSocket(server);


server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
