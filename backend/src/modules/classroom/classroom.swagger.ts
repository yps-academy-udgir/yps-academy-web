/**
 * Classroom Module - Swagger Documentation
 * All API endpoints related to classrooms
 */

/**
 * @swagger
 * /classrooms/stats/overview:
 *   get:
 *     summary: Get classroom statistics overview
 *     description: Retrieve overall statistics for all classrooms (admin and faculty only)
 *     tags:
 *       - Classrooms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Classroom statistics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 */

/**
 * @swagger
 * /classrooms/my:
 *   get:
 *     summary: Get my classrooms
 *     description: Get classrooms for current student or faculty member
 *     tags:
 *       - Classrooms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My classrooms retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /classrooms:
 *   get:
 *     summary: Get all classrooms
 *     description: Retrieve a list of all classrooms (admin, faculty, and student can view)
 *     tags:
 *       - Classrooms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of classrooms retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: Create a new classroom
 *     description: Create a new classroom (admin and faculty only)
 *     tags:
 *       - Classrooms
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - className
 *             properties:
 *               className:
 *                 type: string
 *               section:
 *                 type: string
 *               academicYear:
 *                 type: string
 *     responses:
 *       201:
 *         description: Classroom created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 */

/**
 * @swagger
 * /classrooms/{id}:
 *   get:
 *     summary: Get classroom by ID
 *     description: Retrieve specific classroom details
 *     tags:
 *       - Classrooms
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
 *         description: Classroom retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Classroom not found
 *   put:
 *     summary: Update classroom
 *     description: Update classroom information (admin and faculty only)
 *     tags:
 *       - Classrooms
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
 *     responses:
 *       200:
 *         description: Classroom updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 *       404:
 *         description: Classroom not found
 *   delete:
 *     summary: Delete classroom
 *     description: Delete a classroom (admin only)
 *     tags:
 *       - Classrooms
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
 *         description: Classroom deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin role required.
 *       404:
 *         description: Classroom not found
 */

/**
 * @swagger
 * /classrooms/{id}/schedule:
 *   get:
 *     summary: Get classroom schedule
 *     description: Retrieve the schedule for a classroom
 *     tags:
 *       - Classrooms
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
 *         description: Schedule retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Classroom not found
 *   put:
 *     summary: Update classroom schedule
 *     description: Update the schedule for a classroom (admin and faculty only)
 *     tags:
 *       - Classrooms
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
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 */

/**
 * @swagger
 * /classrooms/{id}/students:
 *   post:
 *     summary: Enroll student in classroom
 *     description: Add a student to a classroom (admin and faculty only)
 *     tags:
 *       - Classrooms
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
 *               - studentId
 *             properties:
 *               studentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student enrolled successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 */

/**
 * @swagger
 * /classrooms/{id}/students/{studentId}:
 *   delete:
 *     summary: Remove student from classroom
 *     description: Remove a student from a classroom (admin and faculty only)
 *     tags:
 *       - Classrooms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student removed successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /classrooms/{id}/faculty:
 *   post:
 *     summary: Assign faculty to classroom
 *     description: Assign a faculty member to teach a classroom (admin only)
 *     tags:
 *       - Classrooms
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
 *               - facultyId
 *             properties:
 *               facultyId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Faculty assigned successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin role required.
 */

/**
 * @swagger
 * /classrooms/{id}/faculty/{facultyId}:
 *   delete:
 *     summary: Remove faculty from classroom
 *     description: Remove a faculty member from teaching a classroom (admin only)
 *     tags:
 *       - Classrooms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: facultyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Faculty removed successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin role required.
 *       404:
 *         description: Not found
 */

export {}; // Empty export - just for swagger JSDoc parsing
