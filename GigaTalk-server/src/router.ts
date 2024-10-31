import { Router } from 'express';
import { serverController } from './controllers/ServerController';

const router = Router();

router.get('/servers', (req, res, next) => serverController.getAllServers(req, res, next));

export { router };
