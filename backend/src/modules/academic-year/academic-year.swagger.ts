/**
 * Academic Year Module - Swagger Documentation
 * All API endpoints related to academic year management and student promotion
 */

/**
 * @swagger
 * /academic-year/promotion-preview:
 *   get:
 *     summary: Get promotion preview
 *     description: Preview which students will be promoted to next academic year (admin only)
 *     tags:
 *       - Academic Year
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Promotion preview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalStudents:
 *                       type: number
 *                     toPromote:
 *                       type: number
 *                     toRetain:
 *                       type: number
 *                     classroomChanges:
 *                       type: array
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin role required.
 */

/**
 * @swagger
 * /academic-year/promote:
 *   post:
 *     summary: Promote students to next year
 *     description: Execute student promotion to next academic year (admin only). This is a destructive operation that cannot be undone.
 *     tags:
 *       - Academic Year
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - confirmed
 *             properties:
 *               confirmed:
 *                 type: boolean
 *                 description: Must be true to proceed with promotion
 *     responses:
 *       200:
 *         description: Student promotion completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     promotedCount:
 *                       type: number
 *                     message:
 *                       type: string
 *       400:
 *         description: Invalid request or promotion already in progress
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin role required.
 *       409:
 *         description: Conflict. Promotion period has restrictions or another promotion is in progress.
 */

export {}; // Empty export - just for swagger JSDoc parsing
