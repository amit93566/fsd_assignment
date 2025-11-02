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

//assignEquipment, updateEquipmentRequest, returnEquipment, getEquipmentRequests

const router = express.Router();

/**
 * @swagger
 * /api/equip/create:
 *   post:
 *     summary: Create new equipment (Admin only)
 *     tags: [Equipment]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - condition
 *               - quantity
 *             properties:
 *               name:
 *                 type: string
 *                 example: Microscope
 *               category:
 *                 type: string
 *                 enum: [Electronics, Furniture, Sports Equipment, Laboratory Equipment]
 *                 example: Laboratory Equipment
 *               condition:
 *                 type: string
 *                 enum: [Excellent, Good, Fair, Poor]
 *                 example: Good
 *               quantity:
 *                 type: number
 *                 example: 5
 *     responses:
 *       201:
 *         description: Equipment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post('/create', auth, requireRole('ADMIN'), createEquipment);

/**
 * @swagger
 * /api/equip/get:
 *   get:
 *     summary: Get equipment list
 *     tags: [Equipment]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by equipment name
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *         description: Filter by condition
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Equipment list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Equipment'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/get', auth, requireRole('ADMIN','STAFF','STUDENT'), getEquipment);

/**
 * @swagger
 * /api/equip/update/{id}:
 *   put:
 *     summary: Update equipment (Admin only)
 *     tags: [Equipment]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Equipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Microscope
 *               category:
 *                 type: string
 *                 enum: [Electronics, Furniture, Sports Equipment, Laboratory Equipment]
 *               condition:
 *                 type: string
 *                 enum: [Excellent, Good, Fair, Poor]
 *               quantity:
 *                 type: number
 *                 example: 5
 *     responses:
 *       200:
 *         description: Equipment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Equipment not found
 */
router.put('/update/:id', auth, requireRole('ADMIN'), updateEquipment);

/**
 * @swagger
 * /api/equip/delete/{id}:
 *   delete:
 *     summary: Delete equipment (Admin only)
 *     tags: [Equipment]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Equipment ID
 *     responses:
 *       200:
 *         description: Equipment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Equipment not found
 */
router.delete('/delete/:id', auth, requireRole('ADMIN'), deleteEquipment);

/**
 * @swagger
 * /api/equip/request/{id}:
 *   post:
 *     summary: Request equipment (Student only)
 *     tags: [Reservations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Equipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - startDate
 *               - endDate
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 2
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-20
 *     responses:
 *       201:
 *         description: Equipment request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Student role required
 */
router.post('/request/:id', auth, requireRole('STUDENT'), requestEquipment);

/**
 * @swagger
 * /api/equip/accept/{id}:
 *   post:
 *     summary: Accept equipment reservation (Staff/Admin only)
 *     tags: [Reservations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff/Admin role required
 *       404:
 *         description: Reservation not found
 */
router.post("/accept/:id", auth, requireRole('STAFF', 'ADMIN'), acceptEquipment);

/**
 * @swagger
 * /api/equip/reject/{id}:
 *   post:
 *     summary: Reject equipment reservation (Staff/Admin only)
 *     tags: [Reservations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff/Admin role required
 *       404:
 *         description: Reservation not found
 */
router.post("/reject/:id", auth, requireRole('STAFF', 'ADMIN'), rejectEquipment);

/**
 * @swagger
 * /api/equip/reservations/my:
 *   get:
 *     summary: Get my reservations (Student/Staff only)
 *     tags: [Reservations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by equipment name or category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACTIVE, RETURNED, REJECTED]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Reservations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/reservations/my', auth, requireRole('STUDENT', 'STAFF'), getMyReservations);

/**
 * @swagger
 * /api/equip/reservations/all:
 *   get:
 *     summary: Get all reservations (Admin/Staff only)
 *     tags: [Reservations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by equipment name, category, or student name
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by equipment category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACTIVE, RETURNED, REJECTED]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Reservations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/reservations/all', auth, requireRole('ADMIN', 'STAFF'), getAllReservations);

/**
 * @swagger
 * /api/equip/return/{reservationId}:
 *   post:
 *     summary: Return equipment (Student/Staff/Admin)
 *     tags: [Reservations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Equipment returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reservation not found
 */
router.post('/return/:reservationId', auth, requireRole('STUDENT', 'STAFF', 'ADMIN'), returnEquipment);

export default router;
