import { RequestHandler, Request, Response, NextFunction } from 'express';

interface PromiseRequestHandler {
  (req: Request, res: Response, next: NextFunction): Promise<unknown>;
}

function wrap(fn: PromiseRequestHandler): RequestHandler {
  return async (req, res, next): Promise<unknown> => {
    return fn(req as Request, res, next).catch(next);
  };
}

export { wrap };
