import axios from 'axios';
import express from 'express';
import appController from '../controllers/app.controller';
import { authenticate } from '../middlewares/authenticate.middleware';

const router = express.Router();
const { login_callback, homePage, user_info, logout_callback, check_session } = appController();

router.get('/', homePage);
router.get('/login_callback', login_callback);
router.get('/me', authenticate, user_info);
router.get('/logout_callback', authenticate, logout_callback);
router.get('/check_session', check_session);
router.get('/check_global_session', async (req, res) => {
  try {
    const result = await axios.get(`${process.env.AUTH_ISSUER}/check_session`);
    res.send(result.data);
  } catch (e) {
    console.log(e);
  }
});

export default {
  routes: router
};
