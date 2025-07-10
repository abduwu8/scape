import { Router } from 'express';
import { linkedInController } from '../controllers/linkedinController';

const router = Router();

router.post('/scrape', linkedInController.scrapeJob);

export default router; 