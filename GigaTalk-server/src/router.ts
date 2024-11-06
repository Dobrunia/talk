import { Router } from 'express';
import { serverController } from './controllers/ServerController.ts';
import { authController } from './controllers/AuthController.ts';
import { authMiddleware } from './middleware/authMiddleware.ts';

const router = Router();

// Маршруты для серверов
router.get('/getAllMyServers', authMiddleware, serverController.getAllMyServers);
router.get('/getMyServerInfoById/:serverId', authMiddleware, serverController.getMyServerInfoById);

// Маршруты для аутентификации
router.post('/register', authController.register);
router.post('/login', authController.login);
//router.post('/guest-login', authController.guestLogin);
//router.post('/logout', authController.logout);

// Маршрут проверки токена
router.get('/verify-token', authMiddleware, authController.verifyToken);

export { router };
