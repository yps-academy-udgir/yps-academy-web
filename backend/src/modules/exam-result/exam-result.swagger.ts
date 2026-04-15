/**
 * Exam Result Module - Swagger Documentation
 * All API endpoints related to exam results
 */

/**
 * @swagger
 * /exam-results:
 *   get:
 *     summary: Get exam results for student
 *     description: Retrieve exam results for the current or specified student (all roles can view)
 *     tags:
 *       - Exam Results
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter by student ID (optional)
 *     responses:
 *       200:
 *         description: Exam results retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: Create exam result
 *     description: Create a new exam result record (admin and faculty only)
 *     tags:
 *       - Exam Results
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - examName
 *               - marks
 *               - totalMarks
 *             properties:
 *               studentId:
 *                 type: string
 *               examName:
 *                 type: string
 *               marks:
 *                 type: number
 *               totalMarks:
 *                 type: number
 *               subject:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Exam result created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 */

/**
 * @swagger
 * /exam-results/bulk:
 *   post:
 *     summary: Bulk save exam results
 *     description: Create multiple exam result records at once (admin and faculty only)
 *     tags:
 *       - Exam Results
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - results
 *             properties:
 *               results:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     examName:
 *                       type: string
 *                     marks:
 *                       type: number
 *                     totalMarks:
 *                       type: number
 *     responses:
 *       201:
 *         description: Exam results saved successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 */

/**
 * @swagger
 * /exam-results/filter:
 *   get:
 *     summary: Get filtered exam results
 *     description: Retrieve exam results with filters (all roles can view)
 *     tags:
 *       - Exam Results
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classroomId
 *         schema:
 *           type: string
 *       - in: query
 *         name: examName
 *         schema:
 *           type: string
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Filtered exam results retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /exam-results/classroom/{classroomId}:
 *   get:
 *     summary: Get exam results by classroom
 *     description: Retrieve all exam results for a specific classroom (all roles can view)
 *     tags:
 *       - Exam Results
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classroomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Classroom exam results retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /exam-results/{id}:
 *   get:
 *     summary: Get exam result by ID
 *     description: Retrieve a specific exam result record (all roles can view)
 *     tags:
 *       - Exam Results
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
 *         description: Exam result retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Exam result not found
 *   put:
 *     summary: Update exam result
 *     description: Update an exam result record (admin and faculty only)
 *     tags:
 *       - Exam Results
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
 *             properties:
 *               marks:
 *                 type: number
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Exam result updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin or Faculty role required.
 *       404:
 *         description: Exam result not found
 *   delete:
 *     summary: Delete exam result
 *     description: Delete an exam result record (admin only)
 *     tags:
 *       - Exam Results
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
 *         description: Exam result deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin role required.
 *       404:
 *         description: Exam result not found
 */

export {}; // Empty export - just for swagger JSDoc parsing
