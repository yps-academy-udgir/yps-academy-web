import { Request, Response } from 'express';
import { subjectConfigService } from './subject-config.service';
import { updateSubjectConfigSchema } from './dto/subject-config.dto';
import { successResponse, errorResponse } from '../../utils/response.util';

function handleError(res: Response, error: any, fallback: string): void {
  if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
  errorResponse(res, fallback, 500);
}

export const getSubjectConfig = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await subjectConfigService.get();
    successResponse(res, config, 'Subject config retrieved');
  } catch (error: any) {
    handleError(res, error, 'Failed to fetch subject config');
  }
};

export const updateSubjectConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = updateSubjectConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 'Validation failed', 400, parsed.error.issues.map((e) => e.message));
      return;
    }
    const config = await subjectConfigService.update(parsed.data);
    successResponse(res, config, 'Subject config updated');
  } catch (error: any) {
    handleError(res, error, 'Failed to update subject config');
  }
};
