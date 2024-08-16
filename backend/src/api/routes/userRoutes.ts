import express from 'express';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';
import { isAuthenticated } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/logout', authController.logOut);
router.get(
  '/authenticated-status',
  isAuthenticated,
  authController.getAuthenticatedStatus
);
router.get('/games', isAuthenticated, userController.getGames);

export default router;
