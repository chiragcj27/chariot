import express from 'express';
import { login } from '../controllers/auth.controller';

const router = express.Router();

router.post('/login', login);
router.post('/refresh', require('./../controllers/auth.controller').refresh);

export default router; 