import { z } from 'zod';

export const promotionPreviewSchema = z.object({
  newAcademicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Academic year must be in YYYY-YYYY format'),
});

export const promoteSchema = z.object({
  newAcademicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Academic year must be in YYYY-YYYY format'),
});

export type PromotionPreviewDto = z.infer<typeof promotionPreviewSchema>;
export type PromoteDto = z.infer<typeof promoteSchema>;
