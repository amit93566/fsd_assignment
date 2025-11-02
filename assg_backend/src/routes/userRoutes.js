import express from 'express';
import { register, login, apime,logouthandler,allStudentsList,allStaffList, getAllClasses,dashboardc } from '../controllers/userController.js';
import { auth, requireRole } from '../middleware/auth.js';
//import { handleValidation, validateUser } from '../middleware/validation.js';
//import User from '../models/User.js';
//import logger from '../config/logger.js';

const router = express.Router();

router.post('/register',register);

router.post('/login', login);

router.post("/logout",logouthandler);

router.get("/dashboard", auth, requireRole('ADMIN'), dashboardc);

router.get("/me", auth, requireRole('ADMIN','STAFF',"STUDENT"), apime);

router.get("/studentslist", auth, requireRole('ADMIN','STAFF'), allStudentsList);

router.get("/classes", auth, requireRole('ADMIN','STAFF'), getAllClasses);

export default router;