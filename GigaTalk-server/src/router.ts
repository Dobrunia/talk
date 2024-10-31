import { Router } from 'express';
import { serverController } from './controllers/ServerController';

const router = Router();

router.get('/getAllServers', (req, res, next) => serverController.getAllServers(req, res, next));

export { router };
