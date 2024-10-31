import { Router } from 'express';
import { serverController } from './controllers/ServerController';

const router = Router();

router.get('/getAllServers', serverController.getAllServers);
router.get('/getServerById/:serverId', serverController.getServerById);

export { router };
