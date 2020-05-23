import { Router } from 'express';

const healthRouter = Router();

/**
 * Health Check
 */
healthRouter.get('/health', (req, res, next) => {
  (async (): Promise<void> => {
    res.sendStatus(200);
  })().catch(next);
});

export { healthRouter };
