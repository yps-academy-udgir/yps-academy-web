/**
 * Student Module - Swagger Documentation
 * All API endpoints related to students
 */

/**
 * @swagger
 * /students/me:
 *   get:
 *     summary: Get current student profile
 *     description: Retrieve the logged-in student's profile information
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student profile retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /students/stats/overview:
 *   get:
 *     summary: Get student statistics overview
 *     description: Retrieve overall statistics for all students (admin and faculty only)
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 */

/**
 * @swagger
 * /students/fees/summary:
 *   get:
 *     summary: Get fees summary
 *     description: Retrieve overall fees summary (admin only)
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fees summary retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin role required.
 */

/**
 * @swagger
 * /students/fees/defaulters:
 *   get:
 *     summary: Get fee defaulters list
 *     description: Retrieve list of students with pending fees (admin only)
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Defaulters list retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin role required.
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve a list of all students (admin and faculty only)
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Filter by classroom ID (optional)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, graduated]
 *         description: Filter by student status (optional)
 *     responses:
 *       200:
 *         description: List of students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 *   post:
 *     summary: Create a new student
 *     description: Create a new student record (admin and faculty only)
 *     tags:
 *       - Students
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
 *               - classId
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               classId:
 *                 type: string
 *                 description: MongoDB ID of the class
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Student profile image
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 */

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student by ID
 *     description: Retrieve a specific student's details by their ID (admin and faculty only)
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student MongoDB ID
 *     responses:
 *       200:
 *         description: Student retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 *       404:
 *         description: Student not found
 *   put:
 *     summary: Update student
 *     description: Update a student's information (admin and faculty only)
 *     tags:
 *       - Students
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
 *         description: Student updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 *       404:
 *         description: Student not found
 *   delete:
 *     summary: Delete student
 *     description: Delete a student record (admin only)
 *     tags:
 *       - Students
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
 *         description: Student deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin role required.
 *       404:
 *         description: Student not found
 */

/**
 * @swagger
 * /students/{id}/payments:
 *   post:
 *     summary: Add payment for student
 *     description: Record a fee payment for a student (admin only)
 *     tags:
 *       - Students
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
 *                 example: 5000
 *               remarks:
 *                 type: string
 *                 example: Tuition fee for April
 *     responses:
 *       201:
 *         description: Payment recorded successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin role required.
 */

/**
 * @swagger
 * /students/{id}/status:
 *   patch:
 *     summary: Update student status
 *     description: Change student status (active/inactive/graduated) (admin only)
 *     tags:
 *       - Students
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, graduated]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin role required.
 */

export {}; // Empty export - just for swagger JSDoc parsing
