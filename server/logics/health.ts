import { RequestHandler } from 'express';

export const health: RequestHandler = (req, res) => {
  return res.json({ status: 'ok' });
};
