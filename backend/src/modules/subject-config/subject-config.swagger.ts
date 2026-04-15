/**
 * Subject Configuration Module - Swagger Documentation
 * API endpoints for managing subject-related configuration
 */

/**
 * @swagger
 * /subject-config:
 *   get:
 *     summary: Get subject configuration
 *     description: Retrieve the current subject configuration (all authenticated users can view)
 *     tags:
 *       - Subject Config
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subject configuration retrieved successfully
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
 *                     subjects:
 *                       type: array
 *                     feeStructure:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     summary: Update subject configuration
 *     description: Update the subject configuration including subjects and fee structure (admin only)
 *     tags:
 *       - Subject Config
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     code:
 *                       type: string
 *               feeStructure:
 *                 type: object
 *                 properties:
 *                   monthlyFee:
 *                     type: number
 *                   admissionFee:
 *                     type: number
 *               academicYearEndMonth:
 *                 type: number
 *                 description: Month when academic year ends (1-12)
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden. Admin role required.
 */

export {}; // Empty export - just for swagger JSDoc parsing
