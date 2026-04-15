/**
 * Log Module - Swagger Documentation
 * All API endpoints related to client-side logging
 */

/**
 * @swagger
 * /logs/client:
 *   post:
 *     summary: Log client-side errors
 *     description: Submit client-side errors, warnings, or info logs to the server for debugging (no authentication required)
 *     tags:
 *       - Logs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - level
 *               - message
 *             properties:
 *               level:
 *                 type: string
 *                 enum: [error, warn, info]
 *                 description: Log severity level
 *               message:
 *                 type: string
 *                 description: Log message
 *               context:
 *                 type: string
 *                 description: Where the error occurred (e.g., component name)
 *               stack:
 *                 type: string
 *                 description: Error stack trace
 *               userAgent:
 *                 type: string
 *                 description: User's browser information
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               additionalData:
 *                 type: object
 *                 description: Any additional context data
 *     responses:
 *       201:
 *         description: Log recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

export {}; // Empty export - just for swagger JSDoc parsing
