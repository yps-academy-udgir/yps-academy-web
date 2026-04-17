/**
 * Attendance Module - Swagger Documentation
 * All API endpoints related to student attendance
 */

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: Get attendance by classroom
 *     description: Retrieve attendance records for a classroom (admin and faculty only)
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classroomId
 *         schema:
 *           type: string
 *         description: Filter by classroom ID (required)
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Filter by date (optional)
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 *   post:
 *     summary: Mark attendance in bulk
 *     description: Record attendance for multiple students at once (admin and faculty only)
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classroomId
 *               - date
 *               - records
 *             properties:
 *               classroomId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [present, absent, late]
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 */

/**
 * @swagger
 * /attendance/summary:
 *   get:
 *     summary: Get attendance summary
 *     description: Retrieve overall attendance statistics (admin and faculty only)
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance summary retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 */

/**
 * @swagger
 * /attendance/students/{id}:
 *   get:
 *     summary: Get student attendance records
 *     description: Retrieve attendance records for a specific student
 *     tags:
 *       - Attendance
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
 *         description: Student attendance records retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Student not found
 */

export {}; // Empty export - just for swagger JSDoc parsing
