import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { adminCreateUser, getAllStaffList } from '../controllers/staffController.js';

const router = express.Router()

router.post('/create', auth, requireRole('ADMIN'), adminCreateUser);

router.get('/stafflist',auth,requireRole("ADMIN"),getAllStaffList)

export default router;