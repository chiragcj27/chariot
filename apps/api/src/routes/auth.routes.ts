import express from 'express';
import { login, verify } from '../controllers/auth.controller';

const router = express.Router();

router.post('/login', login);
router.post('/refresh', require('./../controllers/auth.controller').refresh);
router.post('/verify', verify);

export default router; 