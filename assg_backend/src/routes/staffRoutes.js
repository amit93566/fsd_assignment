import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { adminCreateUser, getAllStaffList } from '../controllers/staffController.js';

const router = express.Router()

/**
 * @swagger
 * /api/staff/create:
 *   post:
 *     summary: Create new staff member (Admin only)
 *     tags: [Staff]
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
 *               - email
 *               - password
 *               - class
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Smith
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane.smith@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               class:
 *                 type: string
 *                 example: 10
 *     responses:
 *       201:
 *         description: Staff member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post('/create', auth, requireRole('ADMIN'), adminCreateUser);

/**
 * @swagger
 * /api/staff/stafflist:
 *   get:
 *     summary: Get all staff list (Admin only)
 *     tags: [Staff]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by email
 *       - in: query
 *         name: class
 *         schema:
 *           type: string
 *         description: Filter by class
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
 *         description: Staff list retrieved successfully
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
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalCount:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/stafflist',auth,requireRole("ADMIN"),getAllStaffList)

export default router;