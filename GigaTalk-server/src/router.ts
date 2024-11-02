import { Router } from 'express';
import { serverController } from './controllers/ServerController';
import { authController } from './controllers/AuthController';
import { authMiddleware } from './middleware/authMiddleware';

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
