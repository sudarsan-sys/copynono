import express from 'express';
import { loginUser, registerUser } from '../controllers/authController.js';

const router = express.Router();

// Route for Login
router.post('/login', loginUser);

// Route for Registration (Fixes 404 error)
router.post('/register', registerUser);

export default router;