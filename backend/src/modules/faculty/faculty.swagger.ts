/**
 * Faculty Module - Swagger Documentation
 * All API endpoints related to faculty members
 */

/**
 * @swagger
 * /faculty/me:
 *   get:
 *     summary: Get current faculty profile
 *     description: Retrieve the logged-in faculty member's profile
 *     tags:
 *       - Faculty
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Faculty profile retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /faculty/stats/overview:
 *   get:
 *     summary: Get faculty statistics overview
 *     description: Retrieve overall statistics for all faculty (admin and faculty only)
 *     tags:
 *       - Faculty
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Faculty statistics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 */

/**
 * @swagger
 * /faculty:
 *   get:
 *     summary: Get all faculty
 *     description: Retrieve a list of all faculty members (admin and faculty only)
 *     tags:
 *       - Faculty
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of faculty retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 *   post:
 *     summary: Create a new faculty member
 *     description: Create a new faculty record (admin only)
 *     tags:
 *       - Faculty
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               qualification:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Faculty created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin role required.
 */

/**
 * @swagger
 * /faculty/{id}:
 *   get:
 *     summary: Get faculty by ID
 *     description: Retrieve specific faculty member details (admin and faculty only)
 *     tags:
 *       - Faculty
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Faculty retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 *       404:
 *         description: Faculty not found
 *   put:
 *     summary: Update faculty information
 *     description: Update a faculty member's information (admin only)
 *     tags:
 *       - Faculty
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Faculty updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin role required.
 *       404:
 *         description: Faculty not found
 *   delete:
 *     summary: Delete faculty member
 *     description: Delete a faculty record (admin only)
 *     tags:
 *       - Faculty
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Faculty deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin role required.
 *       404:
 *         description: Faculty not found
 */

/**
 * @swagger
 * /faculty/{id}/payments:
 *   post:
 *     summary: Add salary payment for faculty
 *     description: Record a salary payment for a faculty member (admin only)
 *     tags:
 *       - Faculty
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *               month:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Salary payment recorded successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin role required.
 */

export {}; // Empty export - just for swagger JSDoc parsing
