import { Request, Response } from 'express';
import { academicYearService } from './academic-year.service';
import { successResponse, errorResponse } from '../../utils/response.util';
import { promotionPreviewSchema, promoteSchema } from './dto/academic-year.dto';

export const academicYearController = {
  async getPromotionPreview(req: Request, res: Response): Promise<void> {
    try {
      const parsed = promotionPreviewSchema.safeParse({ newAcademicYear: req.query['newAcademicYear'] });
      if (!parsed.success) {
        errorResponse(res, parsed.error.issues[0]?.message ?? 'Invalid input', 400);
        return;
      }
      const result = await academicYearService.getPromotionPreview(parsed.data.newAcademicYear);
      successResponse(res, result, 'Promotion preview retrieved');
    } catch (err: any) {
      errorResponse(res, err.message, err.statusCode ?? 500);
    }
  },

  async promote(req: Request, res: Response): Promise<void> {
    try {
      const parsed = promoteSchema.safeParse(req.body);
      if (!parsed.success) {
        errorResponse(res, parsed.error.issues[0]?.message ?? 'Invalid input', 400);
        return;
      }
      const result = await academicYearService.promote(parsed.data);
      successResponse(res, result, `Promotion to ${parsed.data.newAcademicYear} completed`, 200);
    } catch (err: any) {
      errorResponse(res, err.message, err.statusCode ?? 500);
    }
  },
};
