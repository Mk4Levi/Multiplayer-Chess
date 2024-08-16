import express from 'express';
import * as gameController from '../controllers/gameController';
import { isAuthenticated } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', isAuthenticated, gameController.createGame);

export default router;
