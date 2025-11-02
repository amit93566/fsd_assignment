import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { 
  createEquipment, 
  getEquipment, 
  updateEquipment, 
  deleteEquipment,
  requestEquipment,
  acceptEquipment,
  rejectEquipment,
  getMyReservations,
  getAllReservations,
  returnEquipment
} from '../controllers/equipController.js';



const router = express.Router();

router.post('/create', auth, requireRole('ADMIN'), createEquipment);

router.get('/get', auth, requireRole('ADMIN','STAFF','STUDENT'), getEquipment);

router.put('/update/:id', auth, requireRole('ADMIN'), updateEquipment);

router.delete('/delete/:id', auth, requireRole('ADMIN'), deleteEquipment);

router.post('/request/:id', auth, requireRole('STUDENT'), requestEquipment);

router.post("/accept/:id", auth, requireRole('STAFF', 'ADMIN'), acceptEquipment);

router.post("/reject/:id", auth, requireRole('STAFF', 'ADMIN'), rejectEquipment);

router.get('/reservations/my', auth, requireRole('STUDENT', 'STAFF'), getMyReservations);

router.get('/reservations/all', auth, requireRole('ADMIN', 'STAFF'), getAllReservations);

router.post('/return/:reservationId', auth, requireRole('STUDENT', 'STAFF', 'ADMIN'), returnEquipment);

export default router;
