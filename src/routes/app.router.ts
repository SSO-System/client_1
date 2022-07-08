import express from 'express';
import appController from '../controllers/app.controller';
import { createCodeChallenge } from '../middlewares/createCodeChanlenge.middleware';
import { authenticate } from '../middlewares/authenticate.middleware';

const router = express.Router();
const { login_callback, homePage, user_info, logout_callback } = appController();

router.get('/', createCodeChallenge, homePage);
router.get('/login_callback', login_callback);
router.get('/me', authenticate, user_info);
router.get('/logout_callback', authenticate, logout_callback);

export default {
  routes: router
};
