import { Router } from 'express';
import { serverController } from './controllers/ServerController.ts';
import { authController } from './controllers/AuthController.ts';
import { authMiddleware } from './middleware/authMiddleware.ts';
import { userController } from './controllers/UserController.ts';

const router = Router();

// Маршруты для серверов
router.get('/getAllMyServers', authMiddleware, serverController.getAllMyServers);
router.get('/getMyServerInfoById/:serverId', authMiddleware, serverController.getMyServerInfoById);
router.get('/getAllAvailableServers', authMiddleware, serverController.getAllAvailableServers);
router.post('/joinServer', authMiddleware, serverController.joinServer);

// Маршруты пользователя
router.get('/getMyProfileInfo', authMiddleware, userController.getMyProfileInfo);

// Маршруты смены информации о пользователе
//router.post('/changeUsername', authMiddleware, userController.changeUsername);
router.post('/changeAvatar', authMiddleware, userController.changeAvatar);

// Маршруты для аутентификации
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/guest-login', authController.guestLogin);
//router.post('/logout', authController.logout);

// Маршрут проверки токена
router.get('/verify-token', authMiddleware, authController.verifyToken);

export { router };
