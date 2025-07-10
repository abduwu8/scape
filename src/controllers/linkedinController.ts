import { Request, Response } from 'express';
import { linkedInService } from '../services/linkedinService';

export class LinkedInController {
  public async scrapeJob(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.body;

      if (!url || typeof url !== 'string') {
        res.status(400).json({
          success: false,
          error: 'URL is required and must be a string',
        });
        return;
      }

      const jobData = await linkedInService.scrapeJobData(url);

      res.status(200).json({
        success: true,
        data: jobData,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }
}

export const linkedInController = new LinkedInController(); 